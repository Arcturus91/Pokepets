//creamos un middleware para checar los roles que tienen permitido acceder o realizar daterminadas acciones

                //["ADMIN,"User"]
exports.checkRole =(arrayRoles) => {

return (req,res,next)=>{
    //voy a sacar de mi req.session al user logged para saber qe rol tiene

    const { role} = req.session.currentUser
    if(arrayRoles.includes(role)){
        return next()
    } else {
        return res.status(403).send("you don't have permission for this action")
    }


}
}

//agregar link para regresar a una página conocida.