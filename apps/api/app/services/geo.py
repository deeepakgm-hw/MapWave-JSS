# Geospatial projection, containment, and distance calculations using Shapely and PyProj
import math
from typing import Optional, List, Dict, Any
from shapely.geometry import Point, Polygon, shape
from geoalchemy2.shape import to_shape
import pyproj

# Transformer for WGS 84 (EPSG:4326 lat/lon) -> UTM Zone 43N (EPSG:32643 meters for Bangalore)
transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:32643", always_xy=True)

def project_to_utm(lat: float, lon: float) -> tuple[float, float]:
    """Transforms latitude and longitude into UTM 43N coordinates (x, y in meters)."""
    x, y = transformer.transform(lon, lat)
    return x, y

def building_geometry_to_shapely(footprint: Any) -> Optional[Polygon]:
    """Converts GeoAlchemy2 or GeoJSON footprint to a Shapely Polygon."""
    if footprint is None:
        return None
    try:
        if isinstance(footprint, dict):
            return shape(footprint)
        return to_shape(footprint)
    except Exception:
        return None

def point_in_building(lat: float, lon: float, footprint: Any) -> bool:
    """Checks whether (lat, lon) lies inside the building polygon."""
    poly = building_geometry_to_shapely(footprint)
    if poly is None:
        return False
    point = Point(lon, lat)
    return poly.contains(point) or poly.touches(point)

def find_nearest_building(lat: float, lon: float, accuracy_m: float, buildings: List[Any]) -> Dict[str, Any]:
    """
    Finds building containing the point (confidence='inside') or nearest building by UTM distance (confidence='nearby').
    """
    if not buildings:
        return {
            "building_id": None,
            "building_name": "Unknown Location",
            "confidence": "nearby",
            "distance_m": 0.0
        }

    # 1. Check if user is inside any building
    for b in buildings:
        footprint = getattr(b, "footprint", None)
        if point_in_building(lat, lon, footprint):
            return {
                "building_id": str(b.id),
                "building_name": b.name,
                "confidence": "inside",
                "distance_m": 0.0
            }

    # 2. Fall back to nearest building centroid in UTM Zone 43N meters
    user_x, user_y = project_to_utm(lat, lon)
    nearest_b = None
    min_dist = float("inf")

    for b in buildings:
        footprint = getattr(b, "footprint", None)
        poly = building_geometry_to_shapely(footprint)
        if poly is not None:
            centroid = poly.centroid
            b_x, b_y = project_to_utm(centroid.y, centroid.x)
        else:
            # Fallback to building lat/lon if defined
            b_lat = getattr(b, "latitude", lat)
            b_lon = getattr(b, "longitude", lon)
            b_x, b_y = project_to_utm(b_lat, b_lon)

        dist = math.hypot(user_x - b_x, user_y - b_y)
        if dist < min_dist:
            min_dist = dist
            nearest_b = b

    if nearest_b is None:
        nearest_b = buildings[0]
        min_dist = 0.0

    return {
        "building_id": str(nearest_b.id),
        "building_name": nearest_b.name,
        "confidence": "nearby",
        "distance_m": round(min_dist, 1)
    }
