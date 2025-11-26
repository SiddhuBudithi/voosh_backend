import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Transcript = sequelize.define(
  "Transcript",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: { type: DataTypes.STRING, allowNull: false },
    transcript: { type: DataTypes.JSON, allowNull: false },
  },
  { timestamps: true }
);

export default Transcript;
