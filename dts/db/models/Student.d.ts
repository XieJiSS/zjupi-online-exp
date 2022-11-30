import Sequelize from "sequelize";
declare const Student: StudentModelCtor;
export interface StudentCreationAttributes {
    phone: string;
    name: string;
    linkId?: number | null;
}
export interface StudentAdditionalModelAttributes {
    studentId: number;
    linkId: number | null;
}
export type StudentModelAttributes = StudentCreationAttributes & StudentAdditionalModelAttributes;
export type StudentModel = Sequelize.Model<StudentModelAttributes, StudentCreationAttributes> & StudentModelAttributes;
export type StudentModelCtor = Sequelize.ModelCtor<StudentModel>;
export default Student;
