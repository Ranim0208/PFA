// components/TeamManagement.jsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Mail, User, Users, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const TeamManagement = ({ creathonId }) => {
  const [activeTab, setActiveTab] = useState("mentors");
  const [mentors, setMentors] = useState([]);
  const [juryMembers, setJuryMembers] = useState([]);
  const [newMentor, setNewMentor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
  });
  const [newJury, setNewJury] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const addMentor = () => {
    if (newMentor.firstName && newMentor.lastName && newMentor.email) {
      setMentors([...mentors, { ...newMentor, id: Date.now() }]);
      setNewMentor({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialization: "",
      });
    }
  };

  const addJury = () => {
    if (newJury.firstName && newJury.lastName && newJury.email) {
      setJuryMembers([...juryMembers, { ...newJury, id: Date.now() }]);
      setNewJury({ firstName: "", lastName: "", email: "" });
    }
  };

  const removeMentor = (id) => {
    setMentors(mentors.filter((mentor) => mentor.id !== id));
  };

  const removeJury = (id) => {
    setJuryMembers(juryMembers.filter((jury) => jury.id !== id));
  };

  const sendInvitations = (type) => {
    // Implement API call to send invitations
    const emails =
      type === "mentors"
        ? mentors.map((m) => m.email)
        : juryMembers.map((j) => j.email);
    console.log(`Sending invitations to ${type}:`, emails);
    alert(`Invitations sent to ${type}`);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mentors">
            <User className="h-4 w-4 mr-2" /> Mentors
          </TabsTrigger>
          <TabsTrigger value="jury">
            <Users className="h-4 w-4 mr-2" /> Jury
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentors">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={newMentor.firstName}
                onChange={(e) =>
                  setNewMentor({ ...newMentor, firstName: e.target.value })
                }
              />
              <Input
                placeholder="Last Name"
                value={newMentor.lastName}
                onChange={(e) =>
                  setNewMentor({ ...newMentor, lastName: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={newMentor.email}
                onChange={(e) =>
                  setNewMentor({ ...newMentor, email: e.target.value })
                }
              />
              <Input
                placeholder="Phone"
                value={newMentor.phone}
                onChange={(e) =>
                  setNewMentor({ ...newMentor, phone: e.target.value })
                }
              />
              <Input
                placeholder="Specialization"
                value={newMentor.specialization}
                onChange={(e) =>
                  setNewMentor({ ...newMentor, specialization: e.target.value })
                }
                className="md:col-span-2"
              />
            </div>
            <Button onClick={addMentor} className="gap-2">
              <Plus className="h-4 w-4" /> Add Mentor
            </Button>

            {mentors.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentors.map((mentor) => (
                      <TableRow key={mentor.id}>
                        <TableCell>
                          {mentor.firstName} {mentor.lastName}
                        </TableCell>
                        <TableCell>{mentor.email}</TableCell>
                        <TableCell>{mentor.phone}</TableCell>
                        <TableCell>{mentor.specialization}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMentor(mentor.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  onClick={() => sendInvitations("mentors")}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" /> Send Invitations
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="jury">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="First Name"
                value={newJury.firstName}
                onChange={(e) =>
                  setNewJury({ ...newJury, firstName: e.target.value })
                }
              />
              <Input
                placeholder="Last Name"
                value={newJury.lastName}
                onChange={(e) =>
                  setNewJury({ ...newJury, lastName: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={newJury.email}
                onChange={(e) =>
                  setNewJury({ ...newJury, email: e.target.value })
                }
              />
            </div>
            <Button onClick={addJury} className="gap-2">
              <Plus className="h-4 w-4" /> Add Jury Member
            </Button>

            {juryMembers.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {juryMembers.map((jury) => (
                      <TableRow key={jury.id}>
                        <TableCell>
                          {jury.firstName} {jury.lastName}
                        </TableCell>
                        <TableCell>{jury.email}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeJury(jury.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  onClick={() => sendInvitations("jury")}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" /> Send Invitations
                </Button>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
