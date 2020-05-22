import React from "react";
import { db, auth, provider, storage } from "../config/firebase";

export const UsuarioContext = React.createContext();

const UsuarioProvider = (props) => {


  const dataUsuario = { uid: null, email: null, estado: null, role: null  };
  const [usuario, setUsuario] = React.useState(dataUsuario);

  React.useEffect(() => {
    detectarUsuario();
    // para evitar el warning por no poner las dependencias en [] se puede añadir el comentario de abajo cuando la dependencia nos de un loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectarUsuario = () => {
    auth.onAuthStateChanged((user) => {
      console.log('useruario',user)
      if (user) {
        db.collection("usuarios")
          .doc(user.email)
          .get()
          .then((res) => {
            // console.log('usuarios', res.data())
            setUsuario({
              uid: user.uid,
              email: user.email,
              displayName: res.data().displayName,
              photoURL: res.data().photoURL,
              role: res.data().role,
              estado: true
            });
          });
      } else {
        setUsuario({
          uid: null,
          email: null,
          displayName: null,
          photoURL: null,
          estado: false,
          
        });
      }
    });
  };

  const ingresoGoogle = async () => {
    try {
     await auth.signInWithPopup(provider);
    } catch (error) {
      console.log(error);
    }
  };

  const cerrarSesion = () => {
    auth.signOut();
  };

  const actualizarUsuario = async (usuario, nombreUsuario) => {
    console.log("el nuevo nickname es", nombreUsuario);
    console.log("user email", usuario.email);
    try {
      await db.collection("usuarios").doc(usuario.email).update({
        displayName: nombreUsuario,
      });

      setUsuario({
        ...usuario,
        displayName: nombreUsuario,
      });

      console.log("nuevo usuario", usuario);
    } catch (error) {
      console.log(error);
    }
  };

  const editarFoto = async (usuario, imagenEditada) => {
    console.log("vamos a actualizar la imagen de ", usuario.email);
    console.log("la imagen actualizada", imagenEditada);

    try {
      const imagenRef = storage.ref().child(usuario.email).child("foto perfil");
      await imagenRef.put(imagenEditada);
      const imagenURL = await imagenRef.getDownloadURL();

      await db.collection("usuarios").doc(usuario.email).update({
        photoURL: imagenURL,
      });

      setUsuario({
        ...usuario,
        photoURL: imagenURL,
        estado:true
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <UsuarioContext.Provider
      value={{
        usuario,
        ingresoGoogle,
        cerrarSesion,
        editarFoto,
        actualizarUsuario
      }}
    >
      {props.children}
    </UsuarioContext.Provider>
  );
};

export default UsuarioProvider;
