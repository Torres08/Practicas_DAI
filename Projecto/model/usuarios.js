import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({

    "address": {
        "geolocation": {
            "lat": {
                "type": "String"
            },
            "long": {
                "type": "String"
            }
        },
        "city": {
            "type": "String"
        },
        "street": {
            "type": "String"
        },
        "number": {
            "type": "Number"
        },
        "zipcode": {
            "type": "String"
        }
    },
    "id": {
        "type": "Number"
    },
    "email": {
        "type": "String"
    },
    "username": {
        "type": "String"
    },
    "password": {
        "type": "String"
    },
    "name": {
        "firstname": {
            "type": "String"
        },
        "lastname": {
            "type": "String"
        }
    },
    "phone": {
        "type": "String"
    },
    "__v": {
        "type": "Number"
    }
});



const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;