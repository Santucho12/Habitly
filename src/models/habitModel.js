// Modelo de hábito para Firestore y frontend
// Estructura sugerida para cada hábito
// {
//   id: string (Firestore ID),
//   name: string,
//   description: string,
//   frequency: string ("daily", "weekly", etc),
//   days: array (ej: ["Mon", "Wed", "Fri"]),
//   createdAt: Timestamp,
//   completed: boolean,
//   owner: string (uid del usuario)
// }

export const habitCollection = "habits";

export function createHabit({ name, description, frequency, days, owner }) {
  return {
    name,
    description,
    frequency,
    days,
    createdAt: new Date(),
    completed: false,
    owner,
  };
}