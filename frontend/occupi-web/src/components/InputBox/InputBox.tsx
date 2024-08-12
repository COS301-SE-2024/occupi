import { useState } from "react";

type InputBoxProps = {
    type: "password" | "email",
    label: string,
    placeholder: string,
    submitValue: (val: string, validity: boolean) => void;
}

const email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; // Email regex
const password_regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/; // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number

const InputBox = (props: InputBoxProps) => {
    const [err, setError] = useState("");

    function validateInput(e: React.ChangeEvent<HTMLInputElement>){
        if(props.type === "email"){
            if(!email_regex.test(e.target.value)){
                setError("Invalid Email");
                props.submitValue(e.target.value, false);
            }
            else{
                props.submitValue(e.target.value, true);
                setError("");
            }
        }
        else{
            if(!password_regex.test(e.target.value)){
                props.submitValue(e.target.value, false);
                setError("Invalid Password");
            }
            else{
                props.submitValue(e.target.value, true);
                setError("");
            }
        }
    }
    
    return (
        <div className="w-full">
            <div className="flex justify-between mb-[5px] mt-6">
                <h4 className="text-text_col font-normal text-base">{props.label}</h4>
                {err !== "" && <h5 className="text-text_col_red_salmon font-normal text-base">{err}</h5>}
            </div>
            <input
                name={props.type}
                type={props.type}
                autoComplete={props.type === "email" ? "username" : "current-password" } 
                placeholder={props.placeholder}
                onChange={validateInput}
                className={"w-full h-[50px] rounded-[15px] bg-secondary p-[8px]" + (err !== "" ? " border-[2px] border-red_salmon" : "")}
                required={props.type === "email" ? true : false}
            />
        </div>
    )
}

export default InputBox