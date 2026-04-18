import ictBoardImg from "../assets/Screenshot 2026-01-28 185706.png";
import editorialBoardImg from "../assets/IMG-20260129-WA0046.jpg";
import commBoardImg from "../assets/software comm.jpeg";
import mediaBoardImg from "../assets/screen-projector-projector-is-showing-video-digital-video-projector-action_345343-9289.jpg";

export const boards = [
    {
      id: "ict",
      title: "ICT Board",
      icon: "fas fa-laptop-code",
      image: ictBoardImg,
      description:
        "Consists of the public secretary as the overseer, with chairperson and secretary to the board nominated by the board members. Other members are approved by the board. Prepares and updates the KSUCU-MC database. Manages the Facebook account and the union website. Projects all the union activities.",
      social: [
        { icon: "fab fa-facebook", url: "https://www.facebook.com/ksucumc/" },
      ],
      members: [
        {
          role: "Overseer",
          name: "John Doe",
          phone: "+254 701 234 567",
          image: "https://via.placeholder.com/80?text=ICT",
        },
        {
          role: "Chairperson",
          name: "Mary Otieno",
          phone: "+254 702 345 678",
          image: "https://via.placeholder.com/80?text=ICT2",
        },
        {
          role: "Secretary",
          name: "Samuel Karanja",
          phone: "+254 703 456 789",
          image: "https://via.placeholder.com/80?text=ICT3",
        },
      ],
    },

    {
      id: "editorial",
      title: "Editorial Board",
      icon: "fas fa-pen-fancy",
      image: editorialBoardImg,
      description:
        "Consists of the board coordinator as overseer with chairperson and secretary nominated by the board members. Responsible for Beyond Horizon magazine and approved publications.",
      social: [
        { icon: "fab fa-instagram", url: "https://www.instagram.com/ksucumc/" },
      ],
      members: [
        {
          role: "Overseer",
          name: "Jane Smith",
          phone: "+254 703 456 789",
          image: "https://via.placeholder.com/80?text=ED",
        },
        {
          role: "Chairperson",
          name: "Brian Odhiambo",
          phone: "+254 704 567 890",
          image: "https://via.placeholder.com/80?text=ED2",
        },
        {
          role: "Secretary",
          name: "Faith Ndegwa",
          phone: "+254 705 678 901",
          image: "https://via.placeholder.com/80?text=ED3",
        },
      ],
    },

    {
      id: "communication",
      title: "Communication Board",
      icon: "fas fa-comments",
      image: commBoardImg,
      description:
        "Consists of the boards co-ordinator as the overseer with chairperson and secretary to the board nominated by the board members. Other members approved by the board members. Two default members pursuing computer related courses and two defaults pursuing literature. Responsible for publishing the beyond horizon magazine and any publication approved by executive. Responsible for any sell of publications.",
      social: [
        { icon: "fab fa-tiktok", url: "https://www.tiktok.com/@kisiiuniversitycu" }
      ],
      members: [
        {
          role: "Overseer",
          name: "Alice Mwangi",
          phone: "+254 705 678 901",
          image: "https://via.placeholder.com/80?text=COM",
        },
        {
          role: "Chairperson",
          name: "Peter Njoroge",
          phone: "+254 706 789 012",
          image: "https://via.placeholder.com/80?text=COM2",
        },
        {
          role: "Secretary",
          name: "Esther Wairimu",
          phone: "+254 707 890 123",
          image: "https://via.placeholder.com/80?text=COM3",
        },
      ],
    },

    {
      id: "media",
      title: "Media Board",
      icon: "fas fa-camera-retro",
      image: mediaBoardImg,
      description:
        "Responsible for photography, videography, livestreaming, editing, and documenting Christian Union activities and events Consists of the public secretary as the overseer to the board, chairperson and secretary nominated by the board members.Other members appproved by the board.Responsible for: Covering all union events through photography and videography.Managing KSUCU-MC YouTube channel.Advice the executive on buying, maitaining and didposing of board's assets.",
      social: [
        { icon: "fab fa-youtube", url: "https://www.youtube.com/@KSUCU-MC" }
      ],
      members: [
        {
          role: "Overseer",
          name: "David Kimani",
          phone: "+254 707 890 123",
          image: "https://via.placeholder.com/80?text=MED",
        },
        {
          role: "Chairperson",
          name: "Lucy Wanjiru",
          phone: "+254 708 901 234",
          image: "https://via.placeholder.com/80?text=MED2",
        },
        {
          role: "Secretary",
          name: "Kevin Ochieng",
          phone: "+254 709 012 345",
          image: "https://via.placeholder.com/80?text=MED3",
        },
      ],
    },
    {
      id: "software",
      title: "Software Development & Maintenance Board",
      icon: "fas fa-code",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
      description: "Building and sustaining the digital backbone of KSUCU-MC — one commit at a time, for the glory of God. Our board covers every facet of the union's technology stack — from design to deployment.",
      social: [],
      members: [
        {
          role: "Overseer",
          name: "Eng. Emmanuel Ombogo",
          phone: "+254 700 000 000",
          image: "https://via.placeholder.com/80?text=SDB",
        },
        {
          role: "Lead Developer",
          name: "Eng. Kennedy Mutuku",
          phone: "+254 700 000 000",
          image: "https://via.placeholder.com/80?text=SDB2",
        },
        {
          role: "Secretary",
          name: "Eng. Fancy Nateku",
          phone: "+254 700 000 000",
          image: "https://via.placeholder.com/80?text=SDB3",
        },
      ]
    }
];
