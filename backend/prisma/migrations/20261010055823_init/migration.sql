-- CreateTable
CREATE TABLE "teachers" (
    "teacher_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "students" (
    "student_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "face_embedding" JSONB,
    "voice_embedding" JSONB,

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "subject_id" SERIAL NOT NULL,
    "subject_code" TEXT NOT NULL,
    "name" TEXT DEFAULT 'UNKNOWN',
    "section" TEXT DEFAULT 'N/A',
    "teacher_id" INTEGER,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "subject_students" (
    "subject_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,

    CONSTRAINT "subject_students_pkey" PRIMARY KEY ("subject_id","student_id")
);

-- CreateTable
CREATE TABLE "attendance_logs" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "subject_id" INTEGER,
    "student_id" INTEGER,
    "is_present" BOOLEAN DEFAULT true,

    CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teachers_username_key" ON "teachers"("username");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_students" ADD CONSTRAINT "subject_students_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("subject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_students" ADD CONSTRAINT "subject_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("subject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;
