const GoogleStrategy=require("passport-google-oauth20").Strategy,database=require("./database"),passport=require("passport"),usersRef=database.firebase.database().ref("users-sessions");passport.serializeUser((e,a)=>{a(null,e.key)}),passport.deserializeUser((e,a)=>{database.firebase.database().ref(`users-sessions/${e}`).once("value",s=>{let l=s.val();l?a(null,l):a(Error(`User with id ${e} not found`))},e=>{a(e)})}),passport.use(new GoogleStrategy({clientID:"1099496986523-9utr9q7s6386cgmhvemglb89alq1eup4.apps.googleusercontent.com",clientSecret:"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",callbackURL:"/google/callback",scope:["profile","email"]},async(e,a,s,l)=>{try{let t=(await usersRef.orderByChild("googleId").equalTo(s.id).once("value")).val();if(t){let o=Object.keys(t)[0],r=t[o];return r.key=o,r.avatar=s.photos[0].value.replace("=s96-c","=s1080-c")||"https://live.staticflickr.com/65535/51770807081_90dcafbd15_z.jpg",r.username=s._json.given_name,r.name=s._json.name,r.email=s.emails[0].value,r.tag=`${s._json.given_name}#${r.discriminator}`,await usersRef.child(o).update(r),l(null,r)}{let i=Math.floor(9e3*Math.random())+1e3,n=await usersRef.push({googleId:s.id,name:s._json.name,avatar:s.photos[0].value.replace("=s96-c","=s1080-c")||"https://live.staticflickr.com/65535/51770807081_90dcafbd15_z.jpg",username:s._json.given_name,discriminator:i,email:s.emails[0].value,tag:`${s._json.given_name}#${i}`}),c=(await n.once("value")).val();c.key=n.key,l(null,c)}}catch(u){console.log(u),l(u,null)}}));