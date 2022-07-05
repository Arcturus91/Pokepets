//creamos un middleware para checar los roles que tienen permitido acceder o realizar daterminadas acciones

                //["ADMIN,"STAFF"]
exports.checkRole =(arrayRoles) => {

return (req,res,next)=>{
    //voy a sacar de mi req.session al user logged para saber qe rol tiene

    const { role} = req.session.user
    if(arrayRoles.includes(role)){
        return next()
    } else {
        return res.status(403).send("no tienes el nivel requerido para esta accion")
    }


}
}