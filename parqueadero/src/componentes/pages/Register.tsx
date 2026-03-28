import "tailwindcss"
import parking from "../images/parking.png"
import { Link } from "react-router-dom"

function Register() {

    return(

         
    <div style={{backgroundImage:`url(${parking})`}} className="min-h-screen flex items-center justify-center bg-center h-screen bg-cover">
      <form className="bg-white/87 shadow-md/70 max-w-md h-80 rounded">
        <h1 className="text-center font-bold mb-6 mt-3">Crear una Cuenta</h1>
        <input 
          type="text"
          placeholder="Nombre"
           className="border ml-2 mb-6 px-3 "
        />
      
        <input 
          type="text"
          placeholder="Apellido"
          className="border ml-2 mb-6 px-3 "
        />
        <input 
          type="text" 
          placeholder="Número de documento"
          className="border ml-2 mb-6 px-3"
        
        />
        <input 
          type="email"
          placeholder="Correo electronico"
          className="border ml-2 mb-6 px-3"
        
        />
         <input 
           type="password" 
           placeholder="Contraseña"
           className="border ml-2 mb-6 px-3"
         
         />

         <input 
           type="text" 
           placeholder="teléfono"
           className="border ml-2 mb-6 px-3"
         />

        <Link to="/Login">
            <button className="bg-blue-500  text-white px-4 py-2 rounded
            block mx-auto justify-center hover:bg-blue-700 ">Registrarse</button>
        </Link>
        <span className="flex items-center">
          <p className="text-center justify-center px-15 py-3">¿Ya tienes una cuenta?</p>
          <a href="/login" className="text-blue-500 bg- white hover:bg-blue-700">iniciar sesión</a>
        </span>
         

      </form>
    </div>

    )
}

export default Register;