import mongo, {Schema} from 'mongoose'

const user = new Schema({
    name: String,
    job: String,
    age: Number
}) 
user.pre('save', function(next) {
console.log(`Saving user ${this.name} to database`)
next()    
})
user.methods.validateAge = function(cb) {
return /[^0-9]+/.test(this.age)
} 

export default mongo.model('User',user,"test")