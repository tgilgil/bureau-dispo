// Plan de salle MTL — les bureaux sont identifiés par leur numéro.
// Le numéro est extrait automatiquement du nom de la ressource Google (ex. "Bureau #1").

export interface DeskSpot {
  id: number;
  orientation: "landscape" | "portrait"; // landscape = horizontal, portrait = vertical
}

export interface DeskGroup {
  desks: DeskSpot[];
}

export interface FloorSection {
  id: string;
  groups: DeskGroup[];
}

export const MTL_FLOORPLAN: FloorSection[] = [
  {
    id: "left",
    groups: [
      { desks: [{ id: 1, orientation: "landscape" }] },
      { desks: [{ id: 2, orientation: "landscape" }, { id: 3, orientation: "landscape" }] },
      { desks: [{ id: 4, orientation: "landscape" }, { id: 5, orientation: "landscape" }] },
      { desks: [{ id: 6, orientation: "landscape" }, { id: 7, orientation: "landscape" }] },
    ],
  },
  {
    id: "center",
    groups: [
      { desks: [{ id: 8, orientation: "portrait" }, { id: 9, orientation: "portrait" }] },
      { desks: [{ id: 10, orientation: "portrait" }, { id: 11, orientation: "portrait" }, { id: 12, orientation: "portrait" }] },
    ],
  },
  {
    id: "right",
    groups: [
      { desks: [{ id: 13, orientation: "landscape" }, { id: 14, orientation: "landscape" }] },
      { desks: [{ id: 15, orientation: "landscape" }, { id: 16, orientation: "landscape" }] },
      { desks: [{ id: 17, orientation: "landscape" }, { id: 18, orientation: "landscape" }] },
    ],
  },
];

// buildingId retourné par l'Admin SDK pour le bureau MTL.
export const MTL_BUILDING_ID = "AP---MTL";
