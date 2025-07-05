const { Router } = require('express');
const router = Router();
const { getDatabase } = require('../data/database');
const { ObjectId } = require('mongodb');

// GET ALL contacts
router.get('/contacts', async (req, res) => {
  try {
    const db = getDatabase(); // Asegura que estés accediendo a la base correcta
    const contacts = await db.collection('Contacts').find({}).toArray(); // Sin filtros

    res.status(200).json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// GET contact by ID (query parameter ?id=...)
router.get('/contact', async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({ error: "Missing id parameter" });
    }

    const contact = await db.collection('Contacts').findOne({ _id: new ObjectId(id) });

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (err) {
    console.error("Error fetching contact by ID:", err);
    res.status(400).json({ error: "Invalid ID format or server error" });
  }
});

module.exports = router;
