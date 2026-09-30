# TODO: A* Pathfinding graph solver using NetworkX
import math
from typing import List, Tuple, Optional
import networkx as nx

class PathfindingService:
    def __init__(self):
        self.graph = nx.Graph()

    def build_graph(self, nodes: List[dict], edges: List[dict]):
        """Populates NetworkX graph with campus nodes and edges."""
        self.graph.clear()
        for node in nodes:
            self.graph.add_node(
                node["id"],
                pos=(node["latitude"], node["longitude"]),
                floor_id=node.get("floor_id"),
                building_id=node.get("building_id"),
                node_type=node.get("node_type")
            )
        for edge in edges:
            self.graph.add_edge(
                edge["from_node_id"],
                edge["to_node_id"],
                weight=edge["weight_meters"],
                accessible=edge.get("is_accessible", True)
            )

    @staticmethod
    def euclidean_heuristic(u, v, graph):
        """Euclidean distance heuristic for A* pathfinding."""
        pos_u = graph.nodes[u].get("pos", (0, 0))
        pos_v = graph.nodes[v].get("pos", (0, 0))
        return math.hypot(pos_u[0] - pos_v[0], pos_u[1] - pos_v[1])

    def find_shortest_path(self, start_node_id: str, end_node_id: str, accessible_only: bool = False) -> Optional[List[str]]:
        """Calculates shortest path using NetworkX A* algorithm."""
        if start_node_id not in self.graph or end_node_id not in self.graph:
            return None
        
        # Filter subgraph for accessible routes if requested
        subgraph = self.graph
        if accessible_only:
            subgraph = self.graph.edge_subgraph(
                [(u, v) for u, v, d in self.graph.edges(data=True) if d.get("accessible", True)]
            )

        try:
            return nx.astar_path(
                subgraph,
                source=start_node_id,
                target=end_node_id,
                heuristic=lambda u, v: self.euclidean_heuristic(u, v, subgraph),
                weight="weight"
            )
        except nx.NetworkXNoPath:
            return None

pathfinding_service = PathfindingService()
