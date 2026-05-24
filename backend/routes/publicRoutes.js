const express = require('express');
const Package = require('../models/Package');
const router = express.Router();

router.get('/packages',async(req,res) => {
    try{

        const packages = await Package.find({});

        return res.status(200).send(packages);

    }catch(error){
        return res.status(500).send({ message: error.message });
    }
})

module.exports = router;