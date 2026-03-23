import userImg from '../assets/userIMG.jpeg';
import overseerImg from '../assets/overseer_christianminds.jpg';
import secretaryImg from '../assets/secretary_christianminds.jpg';
import peaceImg from '../assets/peace.jpg';
import manuImg from '../assets/mannuu.jpg';
import wandiaImg from '../assets/wandia.jpg';
import khamalahImg from '../assets/khamalaaah.jpg';
import samImg from '../assets/sam.jpg';

export interface CommitteeMember {
    id: number;
    name: string;
    position: string;
    bio: string;
    image: string;
    yearOfStudy: string;
    course: string;
}

const STORAGE_KEY = 'christianMinds_members';

const INITIAL_MEMBERS: CommitteeMember[] = [
    {
        id: 1,
        name: "Stanley Otieno",
        position: "Overseer",
        bio: "Oversee the committee and ensure that all activities align with our core values and mission.",
        image: overseerImg,
        yearOfStudy: "3",
        course: "Special needs education"
    },
    {
        id: 2,
        name: "Jackson Mobui",
        position: "Chairperson",
        bio: "Leading the committee and ensuring that all activities align with our core values and mission.",
        image: userImg,
        yearOfStudy: "3",
        course: "Nursing"
    },
    {
        id: 3,
        name: "Emily",
        position: "Secretary",
        bio: "Keeping records of all the committee activities and ensuring that all activities align with our core values and mission.",
        image: secretaryImg,
        yearOfStudy: "1",
        course: "Bachelor of Laws (LLB)"
    },
    {
        id: 4,
        name: "Peace Makena",
        position: "Treasurer",
        bio: "Managing finances with integrity and transparency to support our various committee activities.",
        image: peaceImg,
        yearOfStudy: "1",
        course: "Medical Laboratory Science"
    },
    {
        id: 5,
        name: "Samuel Mutua",
        position: "Member",
        bio: "Actively participating in planning and execution of events, bringing creativity and energy to the team.",
        image: samImg,
        yearOfStudy: "2",
        course: "Actuarial Science"
    },
    {
        id: 6,
        name: "Faith Wandia",
        position: "Member",
        bio: "Engaging in outreach programs and helping to build strong relationships with other fellowships.",
        image: wandiaImg,
        yearOfStudy: "3",
        course: "Tourism and Hospitality"
    },
    {
        id: 7,
        name: "Emmanuel Baraka",
        position: "Member",
        bio: "Contributing to the spiritual growth of the committee through prayer and coordination of fellowship activities.",
        image: manuImg,
        yearOfStudy: "1",
        course: "Project Management"
    },
    {
        id: 8,
        name: "Beatrice Kalondu",
        position: "Member",
        bio: "Assisting in logistics and operations to ensure smooth running of all our planned events.",
        image: userImg,
        yearOfStudy: "2",
        course: "B.A. Kiswahili and Linguistics"
    },
    {
        id: 9,
        name: "Clifton Khamala",
        position: "Member",
        bio: "Assisting in logistics and operations to ensure smooth running of all our planned events.",
        image: khamalahImg,
        yearOfStudy: "2",
        course: "Software Engineering"
    }
];

export const CommitteeService = {
    getMembers: async (): Promise<CommitteeMember[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }

        // Save initial to storage so it persists
        // We only save if storage is empty to avoid overwriting edits
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
        return INITIAL_MEMBERS;
    },

    saveMember: async (member: CommitteeMember): Promise<CommitteeMember> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const stored = localStorage.getItem(STORAGE_KEY);
        let members: CommitteeMember[] = stored ? JSON.parse(stored) : INITIAL_MEMBERS;

        const existingIndex = members.findIndex(m => m.id === member.id);
        if (existingIndex >= 0) {
            members[existingIndex] = member;
        } else {
            members.push(member);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
        return member;
    },

    deleteMember: async (id: number): Promise<void> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const stored = localStorage.getItem(STORAGE_KEY);
        let members: CommitteeMember[] = stored ? JSON.parse(stored) : INITIAL_MEMBERS;

        members = members.filter(m => m.id !== id);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    }
};
