import React, { useState, useEffect } from "react";
import axios from "axios";
import {Loading } from "../macros/Loading";
const Convert = () => {
    const [loading, setLoading] = useState(true);
    const [from,setFrom] = useState('');
    const [to,setTO] = useState('');
    const [amount, setAmount] = useState('');
    const [data, setData] = useState('');
    const [countries, setCountry] = useState([]);
    

    useEffect(() =>{
        // Data();
        Symbols();
    },[]);


    async function Symbols(){
        setLoading(true);
        axios({
        method: 'get',
        url: 'https://v1.nocodeapi.com/twonty/cx/nBoNPMcrQCUvmOfv/symbols?api_key=UlBjKbXwuRGQIXLNB', 
    }).then(function (response) {
           setCountry(response.data);
           setLoading(false);
    }).catch(function (error) {
            // handle error
            console.log(error);
    })
}


//     async function Data(){
//         setLoading(true);
//                await axios({
//                 method: 'get',
//                 url: `https://v1.nocodeapi.com/twonty/cx/ApwdHiihkdwSKMOB/rates?api_key=UlBjKbXwuRGQIXLNB`, 
//             }).then(function (response) {
//                     // handle success
//                     console.log(response)
//                    setCR(response.data.rates);
//                 //    const info = {
//                 //        date: response.data.date,
//                 //        timestamp:response.data.timestamp
//                 //    }
//             }).catch(function (error) {
//                     // handle error
//                     console.log(error);
//             })
//             setLoading(false);    
// }
    async function Convert(){
        await axios({
        method: 'get',
        url: `https://v1.nocodeapi.com/twonty/cx/nBoNPMcrQCUvmOfv/rates/convert?amount=${amount}&from=${from}&to=${to}&api_key=UlBjKbXwuRGQIXLNB`, 
        }).then(function (response) {
                // handle success
                setData(response.data);
                console.log(response);
        }).catch(function (error) {
                // handle error
                console.log(error);
        })
    }
    const assignFrom = (event) =>{
        setFrom(event.target.value);
    }
    const assignTo = (event) =>{
        setTO(event.target.value);
    }
    const assignAmnt = (event) =>{
        setAmount(event.target.value);
    }
    const convertF = (e) =>{
        e.preventDefault();
        Convert();
    }

       
        return(
               <div className="container-fluid">
                  <Loading loading={loading} />
                  <form onSubmit={convertF}>
                    <div className="form-group">
                    <label>From</label>
                    <select onChange={assignFrom } value={from} className="form-control">
                        {Object.keys(countries).map((key,i) => <option value={key} key={i}>{key}</option>)}
                   </select>
                    </div>
                    <div className="form-group">
                    <label>To</label>
                    <select onChange={ assignTo} value={to} className="form-control">
                        {Object.keys(countries).map((key,i) => <option value={key} key={i}>{key}</option>)}
                   </select>
                    </div>
                    <div className="form-group">
                    <label>Amount</label>
                        <input type="number" className="form-control" value={amount} onChange={ assignAmnt} />
                    </div>

                    <div className="form-group">
                        <input type="submit" className="btn btn-dark btn-block" value="Convert" />
                    </div>
                  </form>
                  <h4>{ data.text || "" }</h4>
                </div> 
        )           
    }
export default Convert;