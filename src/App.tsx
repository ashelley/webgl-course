import React from "react"
import SceneSelector from "./SceneSelector"

export default class App extends React.Component {

    render() {
        return (
            <div style={{ display:'flex', position:'absolute', top:0,left:0,right:0,bottom:0, backgroundColor:'#404040', alignItems:'center', justifyContent:'center'}}>
                <SceneSelector />
            </div>
        )
    }

}