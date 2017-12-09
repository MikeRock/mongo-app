import 'babel-polyfill'
// NO explicit React import required thanks to the ProvideWebpackPlugin (check webpack config)
import {Component} from 'react'
import {connect, Provider} from 'react-redux'
import {applyMiddleware, createStore, combineReducers} from 'redux'
import PropTypes from 'prop-types'
import createSagaMiddleware from 'redux-saga'
import {all, call, put,take,takeEvery,delay} from 'redux-saga/effects'
import ReactDOM from 'react-dom'
import style from './styles.css'

class App extends Component {
   constructor(props) {
    super(props)
    this.clickHandler = this.clickHandler.bind(this)
    this.updateHandler = this.updateHandler.bind(this)
    this.state = {value: ""}
   }
   clickHandler(e) {
       e.preventDefault()
       this.props.dispatch({type:"FETCH_NAME",name:this.inputRef.value})
   }
   updateHandler(e) {
       e.preventDefault()
       this.props.dispatch({type:"UPDATE_DATA", name:this.inputRef.value, age:this.input2Ref.value, job:this.input3Ref.value})
   }
   componentDidMount() {
    if(process.env.NODE_ENV) {console.log(`Running in ${process.env.NODE_ENV} mode`)}
   }
   render() {
       
       return (<div>
        <h1>USER PROFILE</h1> 
        <div>Name:{this.props.name}</div>
        <div>Job: {this.props.job}</div>
        <div>Age: {this.props.age}</div>
        <form  method="GET">
        <input value={this.state.value} onChange={() => {this.setState({value:this.inputRef.value})}} type="text" ref={(input) => {this.inputRef = input}}/>
        <button onClick={this.clickHandler}>Change</button>
        <div>Age:<input  type="text" ref={(input) => {this.input2Ref = input}}/></div>
        <div>Job:<input  type="text" ref={(input) => {this.input3Ref = input}}/></div>
        <button onClick={this.updateHandler}>Update</button>
        </form>
       </div>)
   }
}

const mapStateToProps = (state) => (
    {name:state.name,
    job:state.job,
    age: state.age}
)
const mapDispatchToProps = (dispatch) => (
    {dispatch}
)

const rootReducer = (state = {name:"Mike", job: "Unemployed", age: 31}, action) => {
    switch(action.type) {
        case "UPDATE_NAME": return Object.assign({},state,{name:action.payload.name, age:action.payload.age,job:action.payload.job})
        default: return state   
    }}
const rootSaga = function* () {
yield all([takeEvery((action) => action.type.indexOf("FETCH") !== -1, function*(action) {
let payload = yield new Promise((resolve,reject) => {
    let xhr = new XMLHttpRequest()
    xhr.open('PUT', `/user`, true)
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    xhr.onreadystatechange = () => { 
    if (xhr.readyState == xhr.DONE && xhr.status == 200)
        resolve(JSON.parse(xhr.responseText))        
    }
    xhr.onerror = (err) => {
    console.warn(err)    
    reject(err)    
    }
    xhr.send(JSON.stringify({"name": action.name}))
 })

yield put({type:"UPDATE_NAME",payload})
}),
takeEvery("UPDATE_DATA", function*(action) {
    let payload = yield new Promise((resolve,reject) => {
        let xhr = new XMLHttpRequest()
        xhr.open('PUT', `/update`, true)
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        xhr.onreadystatechange = () => { 
        if (xhr.readyState == xhr.DONE)
            resolve(JSON.parse(xhr.responseText))        
        }
        xhr.onerror = (err) => {
        console.warn(err)    
        reject(err)    
        }
        xhr.send(JSON.stringify({name: action.name,age: action.age, job:action.job}))
     })
    if(payload.err) console.log('Encountered error changing value')
    else console.log('Change was successfull!')
    
    })
])
}

const sagaMiddleware = createSagaMiddleware()

const store = createStore(rootReducer,applyMiddleware(sagaMiddleware))
sagaMiddleware.run(rootSaga)
App = connect(mapStateToProps,mapDispatchToProps)(App)

ReactDOM.render(<Provider store={store}><App /></Provider>,document.getElementById('app'))