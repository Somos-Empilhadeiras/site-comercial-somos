interface Collaborator { 
    name: string; 
    role: string;
    photoUrl: string 
}


export default function CollaboratorsCard({ name, role, photoUrl }: Collaborator) {
    return (
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
            <img 
                src={photoUrl} 
                alt={`${name}'s photo`} 
                className="w-16 h-16 rounded-full object-cover"
            />
            <div>
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="text-gray-500">{role}</p>
            </div>
        </div>
    );
}