import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  getAssignments,
  gradeAssignment,
  modifyAssignment,
  submitAssignment,
} from "@/controllers/assignment.controller"
import protect from "@/middlewares/auth/protect"
import validateRole from "@/middlewares/auth/validateRole"
import fileUpload from "@/middlewares/fileUpload"
import { Router } from "express"

const router = Router()

router
  .route("/")
  .get(protect, getAssignments)
  .post(
    protect,
    validateRole("teacher"),
    fileUpload().array("attachments"),
    createAssignment
  )

router
  .route("/:id")
  .get(protect, getAssignment)
  .delete(protect, validateRole("teacher"), deleteAssignment)
  .put(protect, validateRole("teacher"), modifyAssignment)

router.post("/grade/:id", protect, validateRole("teacher"), gradeAssignment)
router.post(
  "/submit/:id",
  protect,
  validateRole("student"),
  fileUpload().fields([
    { name: "images", maxCount: 3 },
    { name: "audio", maxCount: 1 },
  ]),
  submitAssignment
)

export default router
