const { Router } = require('express');
const router = Router();
const { getDatabase } = require('../data/database');
const { ObjectId } = require('mongodb');

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: API for managing contacts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - favoriteColor
 *         - birthday
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the contact
 *         firstName:
 *           type: string
 *           description: The first name of the contact
 *         lastName:
 *           type: string
 *           description: The last name of the contact
 *         email:
 *           type: string
 *           description: The email of the contact
 *         favoriteColor:
 *           type: string
 *           description: The favorite color of the contact
 *         birthday:
 *           type: string
 *           format: date
 *           description: The birthday of the contact
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the contact was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the contact was last updated
 *       example:
 *         _id: 663f7a9e4c3a4b001f8e9c6a
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         favoriteColor: blue
 *         birthday: 1990-01-01
 *         createdAt: 2024-05-10T14:30:22.000Z
 *         updatedAt: 2024-05-10T14:30:22.000Z
 */

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Returns the list of all contacts
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: The list of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Server error
 */
router.get('/contacts', async (req, res) => {
  try {
    const db = getDatabase();
    const contacts = await db.collection('Contacts').find({}).toArray();
    res.status(200).json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get a contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact id
 *     responses:
 *       200:
 *         description: The contact description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Missing id parameter or invalid ID format
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: The contact was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The id of the created contact
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Missing required fields or invalid email format
 *       500:
 *         description: Server error
 */
router.post('/contacts', async (req, res) => {
  try {
    const db = getDatabase();
    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({ error: "All fields are required: firstName, lastName, email, favoriteColor, birthday" });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const newContact = {
      firstName,
      lastName,
      email,
      favoriteColor,
      birthday,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('Contacts').insertOne(newContact);
    
    res.status(201).json({ 
      id: result.insertedId,
      message: "Contact created successfully"
    });
  } catch (err) {
    console.error("Error creating contact:", err);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

/**
 * @swagger
 * /api/contacts/{id}:
 *   put:
 *     summary: Update a contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               favoriteColor:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: The contact was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Missing id parameter or no fields provided
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.put('/contacts/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;
    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing id parameter" });
    }

    if (!firstName && !lastName && !email && !favoriteColor && !birthday) {
      return res.status(400).json({ error: "At least one field must be provided for update" });
    }

    const updateFields = { updatedAt: new Date() };
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (favoriteColor) updateFields.favoriteColor = favoriteColor;
    if (birthday) updateFields.birthday = birthday;

    const result = await db.collection('Contacts').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json({ message: "Contact updated successfully" });
  } catch (err) {
    console.error("Error updating contact:", err);
    res.status(400).json({ error: "Invalid ID format or server error" });
  }
});

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Delete a contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact id
 *     responses:
 *       204:
 *         description: The contact was deleted
 *       400:
 *         description: Missing id parameter
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.delete('/contacts/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: "Missing id parameter" });
    }

    const result = await db.collection('Contacts').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting contact:", err);
    res.status(400).json({ error: "Invalid ID format or server error" });
  }
});

module.exports = router;