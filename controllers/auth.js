const { response } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');

async function crearUsuario(req, res = response) {
    const { email, name, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El Usuario ya existe con ese email'
            });
        }

        const dbUser = new Usuario(req.body);

        const salt = bcrypt.genSaltSync();
        dbUser.password = bcrypt.hashSync(password, salt);

        const token = await generarJWT(dbUser.id, name);


        await dbUser.save();

        return res.status(201).json({
            ok: true,
            uid: dbUser.id,
            name,
            email,
            token
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }


}

const loginUsuario = async (req, res) => {

    const { email, password } = req.body;

    try {
        const dbUser = await Usuario.findOne({ email });
        if (!dbUser) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo no existe'
            });
        }
        const validPassword = bcrypt.compareSync(password, dbUser.password);

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'El password no es valido'
            });
        }

        const token = await generarJWT(dbUser.id, dbUser.name);

        return res.json({
            ok: true,
            uid: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


}

const revalidarToken = async (req, res = response) => {
    const { uid } = req;

    const dbUser = await Usuario.findById(uid);

    const token = await generarJWT(uid, dbUser.name);

    return res.json({
        ok: true,        
        uid,
        name: dbUser.name,
        email: dbUser.email,
        token
    });
}


module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken
}