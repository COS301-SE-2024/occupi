import React from 'react'
// import { CheckSquareContained } from "../../assets/icons/CheckSquareContained ";
// import { EyeClosed1 } from "../../icons/EyeClosed1";
import "./style.css";
import loginImage from '../../assets/login.png'; // adjust the path as necessary


const LoginForm = (): JSX.Element => {

    const inputStyle = {
        backgroundColor: 'rgba(235, 235, 235, 1)',
        borderRadius: '15px',
        height: '50px',
        width: '430px',
        border: 'none',
        padding: '10px',
        fontSize: '16px',
        // boxSizing: 'border-box'
      };




    return (


        <div className="box">


            <div className="group">
                <div className="overlap">
                    <img className="frame" alt="Frame" src="https://c.animaapp.com/Ac7JpPyQ/img/frame-6.svg" />
                    <div className="div">
                        <div className="text-wrapper">Welcome back to Occupi.</div>
                        <div className="text-wrapper-2">Predict. Plan. Perfect</div>
                    </div>
                </div>
                <div className="group-2">
                    <div className="overlap-group">
                        <input type="email" style={inputStyle} placeholder="Email Address" />
                    </div>
                    {/* <div className='div2'>Email Address</div> */}
                </div>
                <div className="group-3">
                <div className="overlap-group">
                        <input type="password" style={inputStyle} placeholder="Password" />
                    </div>
                    {/* <div className='div2'>Password</div> */}
                </div>
                <div className="overlap-4">
                    <div className="group-4">
                        <div className="text-wrapper-7">Remember me</div>
                    </div>
                    <div className="text-wrapper-8">Forgot Password?</div>
                </div>
                <button className="login-button">
                    <div className="text-wrapper-9">Login</div>
                </button>
                <div className="overlap-5">
                    <p className="p">New to occupi?</p>
                    <div className="text-wrapper-10">Learn more</div>
                </div>
               
            </div>
            <div className='image-container'>
            <img className='image' src= {loginImage} alt="welcomes" />
</div>
        </div>
    );
}

export default LoginForm
