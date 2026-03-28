import { Link } from "react-router-dom"
import shopping from "../images/shopping.jpg"

function Login() {

    return (
         <div style={{backgroundImage:`url(${shopping})`}} className="min-h-screen flex items-center justify-center bg-center h-screen bg-cover">
      <form className="bg-white/87 shadow-md/70 max-w-md h-80 rounded">
        <h1 className="text-center font-bold mb-6 mt-3 ml-">Inicio</h1>

      
        
        <input 
          type="email"
          placeholder="Correo electronico"
          className="border ml-10 mb-6 px-3 flex items-center "
        
        />
         <input 
           type="password" 
           placeholder="Contraseña"
           className="border ml-10 mb-6 px-3 flex items-center "
         
         />

    

        <Link to="/login">
            <button className="bg-blue-500  text-white m-3 px-4 py-1 rounded
             flex mx-auto justify-center hover:bg-blue-700 ">Continuar</button>
        </Link>

        <span className="flex items-center">
          <p className="ml- px-5 py-10">¿no tienes una cuenta?</p>
          <a href="/login" className="text-blue-500 bg- white hover:bg-blue-700 p-3">Registrarse</a>
        </span>

      </form>
    </div>

       
    )

}

export default Login