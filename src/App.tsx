import React from "react"
import WebGLCanvas from "./WebGLCanvas";
import HtmlCanvas from "./HtmlCanvas";

export default class App extends React.Component {

    render() {
        return <div style={{ display:'flex', 
                             flexGrow:1, 
                             backgroundColor:'#404040'}}>
                    <div style={{flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {/* <WebGLCanvas />          */}
                        <HtmlCanvas />
                    </div>
                </div>
    }

}