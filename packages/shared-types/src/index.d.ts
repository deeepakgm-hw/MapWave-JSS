export interface Coordinates {
    latitude: number;
    longitude: number;
    altitude?: number;
}
export interface Building {
    id: string;
    name: string;
    code: string;
    description?: string;
    centerCoordinates: Coordinates;
    floors?: Floor[];
    createdAt: Date;
    updatedAt: Date;
}
export interface Floor {
    id: string;
    buildingId: string;
    floorNumber: number;
    name: string;
    svgFloorPlanUrl?: string;
    geoJsonData?: Record<string, unknown>;
    rooms?: Room[];
}
export type RoomType = 'CLASSROOM' | 'LAB' | 'FACULTY_OFFICE' | 'RESTROOM' | 'ELEVATOR' | 'STAIRS' | 'ENTRANCE' | 'OTHER';
export interface Room {
    id: string;
    floorId: string;
    roomNumber: string;
    name?: string;
    type: RoomType;
    coordinates?: Coordinates;
    occupantIds?: string[];
}
export type NavNodeType = 'OUTDOOR_WALKWAY' | 'BUILDING_ENTRANCE' | 'INDOOR_HALLWAY' | 'STAIR_LANDING' | 'ELEVATOR' | 'ROOM_DOOR';
export interface NavNode {
    id: string;
    type: NavNodeType;
    buildingId?: string;
    floorId?: string;
    coordinates: Coordinates;
}
export interface NavEdge {
    id: string;
    fromNodeId: string;
    toNodeId: string;
    weightMeters: number;
    isAccessible: boolean;
    bidirectional: boolean;
}
export interface RouteRequest {
    startNodeId?: string;
    endNodeId?: string;
    startCoords?: Coordinates;
    endCoords?: Coordinates;
    accessibleOnly?: boolean;
}
export interface RouteSegment {
    edgeId: string;
    fromNode: NavNode;
    toNode: NavNode;
    distanceMeters: number;
    instruction: string;
}
export interface RouteResponse {
    totalDistanceMeters: number;
    estimatedDurationSeconds: number;
    segments: RouteSegment[];
    pathCoordinates: Coordinates[];
}
export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}
//# sourceMappingURL=index.d.ts.map