
import Mongoose from 'mongoose';
import Analytics from '../models/analytics.js';
import Project from '../models/project.js'
import Reference from '../models/reference.js'

export const fetchAll = async(req,res) => {

    const userId = req.userId

    try{
        
        let query = Project.find({creator: userId},{eventName : 1,eventType: 1,eventLocation : 1,dateFrom : 1,createdAt: 1,status: 1}).sort({createdAt: -1})

        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;
        const total = await Project.countDocuments({creator: userId});
        

        const pages = Math.ceil(total / pageSize);

        query = query.skip(skip).limit(pageSize)

        if(page > pages){
            return res.status(404).json({
                status: 'fail',
                message: "Page not Found"
            })
        }

        const result = await query;
        
        res.status(200).json({
            status: 'success',
            count: result.length,
            page,
            pages,
            data: result
        })

    }catch(error){
        res.status(404).json({message: error.message});
    }
}

export const createProject = async(req,res) => {
    
    const project = req.body;
    const newProject = new Project({...project, creator: req.userId, createdAt: new Date().toISOString(),status: 0})

    try{
        await newProject.save()
        console.log(newProject.amountPaid)
        // if(!Mongoose.Types.ObjectId.isValid(project.reference.id)) return res.status(404).send("Reference doesn't exist!")
        const result = await Reference.findById(project.reference.id)
        const data = {
            reference_name: result.reference_name,
            count : result.count + 1 
        }
        await Reference.findByIdAndUpdate(project.reference.id,data,{new: true})
        
        if(project.amountPaid > 0)
        {  
            const analytics = await Analytics.findOne({creator:req.userId})
            console.log(analytics)
            const analyticData = {
                revenue: parseFloat(analytics.revenue) + parseFloat(project.amountPaid)
            }
            console.log(analyticData)
            console.log(analytics.id)
            const updatedAnalytics = await Analytics.findByIdAndUpdate(analytics.id,analyticData,{new:true})
            console.log(updatedAnalytics)
    
            }
        
        res.status(201).json(newProject)

    }
    catch(error){
        res.status(409).json({message: error.message})
    }
}

export const updateProject = async(req,res) => {
    const project = req.body
    const {id} = req.params

    if(!Mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("Project doesn't exist!")

    const result = await Project.findById(id)
    

    if(result?.creator === req.userId)
    {
        const updatedProject = await Project.findByIdAndUpdate(id,{...project, id},{new: true})
        console.log(result.amountPaid)
        console.log(project.amountPaid)
        if(result.amountPaid !== project.amountPaid){
            
            const analytics = await Analytics.findOne({creator:req.userId})
            var diff = 0
            if(result.amountPaid >= project.amountPaid){
                diff = parseFloat(result.amountPaid) - parseFloat(project.amountPaid)
            }
            else{
                diff = parseFloat(project.amountPaid) - parseFloat(result.amountPaid)
            }
            const aData = {
                revenue: parseFloat(analytics.revenue) + diff
            }

            await Analytics.findByIdAndUpdate(analytics.id, aData, {new: true})
            // const newAData = {
            //     revenue: parseFloat(analytics.revenue) + parseFloat(project.amountPaid)
            // }
            // await Analytics.findByIdAndUpdate(analytics.id, newAData, {new: true})
        }

        if(result.reference.id !== project.reference.id && result.reference.id !== ""){

            const ref = await Reference.findById(result.reference.id)
            const data = {
            reference_name: ref.reference_name,
            count : ref.count - 1 
            }
        await Reference.findByIdAndUpdate(result.reference.id,data,{new: true})
        const newRef = await Reference.findById(project.reference.id)
        const newData = {
            reference_name: newRef.reference_name,
            count : newRef.count + 1 
        }
        await Reference.findByIdAndUpdate(project.reference.id,newData,{new: true})
        
        }

        else if (result.reference.id !== ""){
            const check = await Reference.findById(project.reference.id)
        const empty_data = {
            reference_name: check.reference_name,
            count : check.count + 1 
        }
        await Reference.findByIdAndUpdate(project.reference.id,empty_data,{new: true})
        }
        
        
        res.json(updatedProject)
    }
    else {
        return res.status(403).send("Unauthorized");
    }
    
}

export const deleteProject = async(req,res) => {

    const {id} = req.params

    if(!Mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("Project doesn't exist!")

    const result = await Project.findById(id)
        
    if(result?.creator === req.userId)
    {
        await Project.findByIdAndRemove(id)
        if(result?.status <= 2){
            const analytics = await Analytics.findOne({creator:req.userId})
            const data = {
                revenue: parseFloat(analytics.revenue) - parseFloat(result.amountPaid)
            }
            await Analytics.findByIdAndUpdate(analytics.id, data, {new: true})
        }
        res.json({message: "Post deleted Successfully"})
    }
    else {
        return res.status(403).send("Unauthorized");
    }

}

export const fetchSingleProject = async(req,res) => {
    const projectId = req.params
    
    const data = await Project.findOne({"_id": projectId.id})
    
    if(req.userId === data?.creator)
    {
        res.status(200).json(data)

    }
    else{
        res.status(404).json({error: "Data not found"})
    }



}


export const fetchUpcomingEvents = async(req,res) => {
    const userId = req.userId

    try{
        const today = new Date()
        let result = await Project.find({creator: userId,status: {$ne : 0},dateFrom: {$gte : today}},{eventName : 1,eventLocation: 1,dateFrom : 1}).limit(5).sort({dateFrom: 1})
                
        res.status(200).json({
            status: 'success',
            data: result
        })

    }catch(error){
        res.status(404).json({message: error.message});
    }
}

export const pushPipeline = async(req,res) => {
    const {id} = req.params

    if(!Mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("Project doesn't exist!")
    const result = await Project.findById(id)
    if(result?.creator === req.userId){
        if(result?.status < 4){
            result.status += 1
            const updatedProject = await Project.findByIdAndUpdate(id,{...result, id},{new: true})
            res.json(updatedProject)
        }
        else{
            res.json("The Project is wrapped")
        }
    }
    
}