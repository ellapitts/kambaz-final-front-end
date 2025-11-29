"use client";
export const dynamic = 'force-dynamic'; // added due to reactjs build error
import { useSelector } from "react-redux"; 

export default function HelloReudx() {
    const { message } = useSelector((state: { helloReducer: { message: string }}) => state.helloReducer);
    return (
        <div id="wd-hello-redux">
            <h3>Hello Redux</h3>
            <h4>{message}</h4>
            <hr/>
        </div>
    );
}