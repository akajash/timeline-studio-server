import Mongoose from 'mongoose';
import Analytics from '../models/analytics.js';
import Project from '../models/project.js';
import Task from '../models/Tasks.js';
import user from '../models/user.js';
import User from '../models/user.js';
import Workforce from '../models/Workforce.js';

export const getAnalytics = async(req,res) => {
    const userId = req.userId
    try{
        const analytics = await Analytics.findOne({user:userId})
        res.status(200).json(analytics)
  
    }catch(error){
        console.log(error.message)
    }

}

export const dashboardData = async(req,res) => {
    
    const userId = req.userId
    var x = new Date();
    x.setMonth(x.getMonth()-1);
    var y = new Date();
    y.setMonth(y.getMonth()-2);
    try{
        const today = new Date()
        const currency = await user.findById(userId,{currency:1})
        const analytics = await Analytics.findOne({creator:userId})
        const leads = await Project.countDocuments({creator: userId,status:0,createdAt: {$gte: x}})
        const prevLeads = await Project.countDocuments({creator: userId,status:0,createdAt: {$lt: x, $gte: y}})
        const orders = await Project.countDocuments({creator: userId,status:{$ne: 0},createdAt: {$gte: x}})
        const prevOrders = await Project.countDocuments({creator: userId,status:{$ne: 0},createdAt: {$lt: x, $gte: y}})
        const tasks = await Task.countDocuments({creator:userId,status:{$ne: 1}})
        const pendingTasks = await Task.countDocuments({creator:userId,status: 0,deadline: { $lt: today }})
      

        var leadsInc = false;
        var leadsPercentage = 0.0;

        if(leads > prevLeads){
            leadsInc = true;
            leadsPercentage = ((leads-prevLeads)/leads)*100;
            
        }
        else if(leads < prevLeads){
            leadsInc = false;
            leadsPercentage = ((prevLeads-leads)/leads)*100;
        }
        else{
            leadsInc=true;
            leadsPercentage = 0.0;
        }

        var ordersInc = false;
        var ordersPercentage = 0.0;

        if(orders > prevOrders){
            ordersInc = true;
            ordersPercentage = ((orders-prevOrders)/orders)*100;
            
        }
        else if(orders < prevOrders){
            ordersInc = false;
            ordersPercentage = ((prevOrders-orders)/orders)*100;
        }
        else{
            ordersInc=true;
            ordersPercentage = 0.0;
        }

        
        res.status(200).json({
            status: 'success',
            leads,
            orders,
            leadsInc,
            leadsPercentage,
            ordersInc,
            ordersPercentage,
            revenue: analytics.revenue,
            tasks,
            pendingTasks,
            currency: currency.currency
        })
        

        


    }
    catch(error){
        console.log(error.message)
    }

}


export const profileData = async(req,res) => {
    const userId = req.userId
    try{
        const user = await User.findById(userId)
        const orders = await Project.countDocuments({creator: userId,status:{$ne: 0}})
        const tasks = await Task.countDocuments({creator:userId,status:{$ne: 1}})
        const emp = await Workforce.countDocuments({creator: userId})

        res.status(200).json({
            status: 'success',
            country: user.country,
            currency: user.currency,
            name: user.name,
            email: user.email,
            shoots: orders,
            tasks,
            workforces: emp
        })

    }
    catch(error){
        console.log(error.message)
    }
    
}

export const updateProfile = async(req,res) => {
    const profile = req.body
    try{
        const updatedProfile = await User.findByIdAndUpdate(req.userId, {...profile})
        res.status(200).json(updatedProfile)
    }
    catch(error){
        console.log(error.message)
    }
}

// export const updateAnalytics = async(req,res) => {
//     const settings = req.body
//     console.log(settings)
//     try{
//         const updatedSettings = await EmailSettings.findOneAndUpdate({user:req.userId}, {...settings})
//         res.json(updatedSettings)
//     }
//     catch(error){
//         res.status(409).json({message: error.message})
//     }
    

    
    
// }

