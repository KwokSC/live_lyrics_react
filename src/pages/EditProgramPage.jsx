import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EditProgramPage(){

    const {programId} = useParams
    const [program, setProgram] = useState({})

    useEffect((
        
    )=>{},[])

    return(
        <div className="edit-program-page">
            
        </div>
    )
}