import express from "express"
import SupportTicket from "../../models/SupportTicket.js"

const router = express.Router()

/* ================= CREATE ================= */

router.post("/", async (req, res) => {

  try {

    const ticket =
      await SupportTicket.create(
        req.body
      )

    res.json({
      success: true,
      data: ticket
    })

  } catch (err) {

    console.error(
      "❌ CREATE TICKET ERROR:",
      err
    )

    res.status(500).json({
      message:
        "Failed to create ticket"
    })
  }
})

/* ================= GET ALL ================= */

router.get("/", async (req, res) => {

  try {

    const tickets =
      await SupportTicket
        .find()
        .sort({
          createdAt: -1
        })

    res.json({
      success: true,
      data: tickets
    })

  } catch (err) {

    console.error(
      "❌ LOAD TICKETS ERROR:",
      err
    )

    res.status(500).json({
      message:
        "Failed to load tickets"
    })
  }
})

/* ================= REPLY ================= */

router.post("/:id/reply", async (req, res) => {

  try {

    const ticket =
      await SupportTicket.findById(
        req.params.id
      )

    if (!ticket) {

      return res.status(404).json({
        message:
          "Ticket not found"
      })
    }

    ticket.replies.push({

      sender: "admin",

      message:
        req.body.message
    })

    await ticket.save()

    res.json({
      success: true,
      data: ticket
    })

  } catch (err) {

    console.error(
      "❌ REPLY ERROR:",
      err
    )

    res.status(500).json({
      message:
        "Reply failed"
    })
  }
})

/* ================= ARCHIVE ================= */

router.patch("/:id/archive", async (req, res) => {

  try {

    const ticket =
      await SupportTicket.findByIdAndUpdate(

        req.params.id,

        {
          archived: true
        },

        {
          new: true
        }
      )

    res.json({
      success: true,
      data: ticket
    })

  } catch (err) {

    console.error(
      "❌ ARCHIVE ERROR:",
      err
    )

    res.status(500).json({
      message:
        "Archive failed"
    })
  }
})

export default router