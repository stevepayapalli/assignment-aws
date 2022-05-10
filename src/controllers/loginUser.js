const loginUser = async function (req, res) {
    try {
    let body = req.body
    if (Object.keys(body) != 0) {
    let userName = req.body.email;
    let passwords = req.body.password;
    if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(userName))) { return res.status(400).send({ status: false, msg: "Please provide a valid email" }) }
    if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(passwords))) {
    return res.status(400).send({ status: false, msg: "please provide valid password with one uppercase letter ,one lowercase, one character and one number " })
    }
    let user = await userModel.findOne({ email: userName, password: passwords });
    
    if (!user) {
    return res.status(400).send({
    status: false,msg: "username or the password is not correct" });
    }
    
    let token = jwt.sign(
    {
     userId: user._id,
    email: user._email
    
    }, "bookprojectGroup19", { expiresIn: "15min" }
    
    );
    res.status(200).setHeader("x-api-key", token);
    return res.status(201).send({ status: "loggedin", token: token });
    }
    
    else { return res.status(400).send({ msg: "Bad Request" }) }
    
    }
    catch (err) {
    
    return res.status(500).send({ msg: err.message })
    }
    
    };
    

    module.exports.loginUser=loginUser;