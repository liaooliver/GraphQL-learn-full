const { ApolloServer } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');

const typeDefs = `
    enum PhotoCategory{
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }

    input PostPhotoInput{
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }

    type Query{
        totalPhotos:Int!
        allPhotos:[Photo!]!
    }

    type Mutation{
        postPhoto(input:PostPhotoInput!): Photo!
    }

    scalar DateTime

    type Photo{
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        created: DateTime!
        postedBy: User
        taggedUsers: [User!]!
    }

    type User{
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
        inPhotos:[Photo!]!
    }
`

var id = new Date();
var users = [
    { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
    { "githubLogin": "gPlake", "name": "Glen Plake" },
    { "githubLogin": "sSchmidt", "name": "Scot Schmidt" }
]


var tags = [
    { photoID: 1, userID: "gPlake" },
    { photoID: 2, userID: "sSchmidt" },
    { photoID: 2, userID: "mHattrup" },
    { photoID: 2, userID: "gPlake" },
]

var photos = [
    {
        id:1,
        name: "Dropping",
        description: " the heart",
        category: "ACTION",
        githubUser: "gPlake"
    },
    {
        id: 2,
        name: "Enjoying",
        description: " the heart",
        category: "SELFIE",
        githubUser: "sSchmidt"
    },
    {
        id: 3,
        name: "Gunbarrel 25",
        description: " the heart",
        category: "LANDSCAPE",
        githubUser: "mHattrup"
    },
    {
        id: 4,
        name: "Gunbarrel 765",
        description: " the heart",
        category: "LANDSCAPE",
        githubUser: "mHattrup"
    }
]

const resolvers = {
    Query:{
        totalPhotos: () => photos.length,
        allPhotos:() => photos,
    },
    Mutation:{
        postPhoto(parent, args){
            
            let photo = {
                id:id,
                ...args.input
            }
            photos.push(photo)
            return photo
        }
    },
    Photo:{
        url: parent => 'www.youtube.com',
        postedBy: parent =>{
            return users.find(u => u.githubLogin === parent.githubUser );
        },
        taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id)
            .map(tag => { console.log(tag) ; return tag.userID} )
            .map(userID => users.find(u => u.githubLogin === userID ))
    },
    User:{
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin);
        },
        inPhotos: parent => tags.filter(tag => tag.userID === parent.id)
                            .map(tag => tag.photoID)
                            .map(photoID => photos.find(p => p.id === photoID))
    },
    DateTime: new GraphQLScalarType({
        name:'DateTime',
        description: 'A valid date time value',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({url})=>{
    console.log(`GraphQL Service running on ${url}`)
})