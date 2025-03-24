import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { profile } from "console";



export const sendMessage = async (req: Request, res: Response) => {
    try {
       const { message } = req.body;
       const { id:receivedId } = req.params;
       const senderId = req.user.id;

       let conversation = await prisma.conversation.findFirst({
         where: {
            participantIds: {
                hasEvery: [senderId, receivedId],
            },
         },
       });

       if(!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                participantIds: {
                    set: [senderId, receivedId], 
                },
            },
        });
       }

       const newMessage = await prisma.message.create({
        data: {
            senderId,
            body: message,
            conversationId: conversation.id,
        },
       });

       if (newMessage) {
        conversation = await prisma.conversation.update({
            where: {
                id: conversation.id,
            },
            data: {
                messages: {
                    connect: {
                        id: newMessage.id,
                    },
                },
            },
        });
       }
       return res.status(201).json(newMessage);
       // Socket will be implemented later

    } catch (error:any) {
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({ message: "Server Error" });
    }
}

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user.id;

        const conversation = await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [senderId, userToChatId],
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createAt: "asc",
                    },
                },
            },
        })

        if (!conversation) {
            return res.status(200).json([]);
        }

        res.status(200).json(conversation.messages);
    } catch (error:any) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Server Error" });
    }
};

export const getConversations = async (req: Request, res: Response) => {
    try {
        const senderId = req.user.id;

        const conversations = await prisma.conversation.findMany({
            where: {
                participantIds: {
                    has: senderId,
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createAt: "desc",
                    },
                    take: 1,
                },
            },
        });

        res.status(200).json(conversations);
    } catch (error:any) {
        console.error("Error in getConversations: ", error.message);
        res.status(500).json({ error: "Server Error" });    
    }
};

export const getUsersForSidebar = async (req:Request, res:Response) => {
    try {
        const authUserId = req.user.id;

        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: authUserId,
                },
            },
            select: {
                id: true,
                fullName: true,
                profilePic: true,
            }
        })
    } catch (error:any) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Server Error" });
        
    }
}
