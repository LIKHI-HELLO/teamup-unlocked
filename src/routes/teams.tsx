import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  UserPlus,
  Users,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/teams")({
  component: TeamsPage,
});

type Team = {
  id: string;
  name: string;
  description: string;
  event_name: string;
  required_skills: string[];
  member_count: number;
  max_members: number;
  created_by: string;
  created_at: string;
};

type JoinRequest = {
  id: string;
  team_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventName, setEventName] = useState("");
  const [skills, setSkills] = useState("");
  const [maxMembers, setMaxMembers] = useState("4");

  // Load teams and join requests
  async function loadTeams() {
    setLoading(true);

    try {
      const { data: authData } =
        await supabase.auth.getUser();

      const userId = authData.user?.id || "";
      setCurrentUserId(userId);

      const { data: teamData, error: teamError } =
        await (supabase as any)
          .from("teams")
          .select("*")
          .order("created_at", { ascending: false });

      if (teamError) {
        console.error(teamError);
        toast.error("Unable to load teams.");
        return;
      }

      setTeams((teamData || []) as Team[]);

      if (userId) {
        const { data: requestData, error: requestError } =
          await (supabase as any)
            .from("team_join_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (requestError) {
          console.error(requestError);
          toast.error("Unable to load join requests.");
        } else {
          setRequests((requestData || []) as JoinRequest[]);
        }
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while loading teams.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  // Create team
  async function handleCreateTeam(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (
      !name.trim() ||
      !description.trim() ||
      !eventName.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setCreating(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        toast.error("Please log in first.");
        return;
      }

      const requiredSkills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const { error } = await (supabase as any)
        .from("teams")
        .insert({
          name: name.trim(),
          description: description.trim(),
          event_name: eventName.trim(),
          required_skills: requiredSkills,
          max_members: Number(maxMembers),
          member_count: 1,
          created_by: authData.user.id,
        });

      if (error) {
        console.error(error);
        toast.error(error.message);
        return;
      }

      toast.success("Team created successfully!");

      setName("");
      setDescription("");
      setEventName("");
      setSkills("");
      setMaxMembers("4");
      setOpen(false);

      await loadTeams();
    } catch (error) {
      console.error(error);
      toast.error("Could not create team.");
    } finally {
      setCreating(false);
    }
  }

  // Send join request
  async function handleJoinRequest(teamId: string) {
    if (!currentUserId) {
      toast.error("Please log in to request membership.");
      return;
    }

    const team = teams.find((item) => item.id === teamId);

    if (!team) return;

    if (team.created_by === currentUserId) {
      toast.error("You are already the creator of this team.");
      return;
    }

    if (team.member_count >= team.max_members) {
      toast.error("This team is already full.");
      return;
    }

    const existingRequest = requests.find(
      (request) =>
        request.team_id === teamId &&
        request.user_id === currentUserId
    );

    if (existingRequest) {
      toast.error(
        `Your previous request is ${existingRequest.status}.`
      );
      return;
    }

    const { error } = await (supabase as any)
      .from("team_join_requests")
      .insert({
        team_id: teamId,
        user_id: currentUserId,
        status: "pending",
      });

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        toast.error("You have already requested to join.");
      } else {
        toast.error(error.message || "Request could not be sent.");
      }

      return;
    }

    toast.success("Join request sent successfully!");
    await loadTeams();
  }

  // Approve or reject a join request
  async function handleRequestDecision(
    requestId: string,
    decision: "approved" | "rejected"
  ) {
    setProcessingId(requestId);

    try {
      const { data, error } = await (supabase as any).rpc(
        "respond_to_team_request",
        {
          p_request_id: requestId,
          p_decision: decision,
        }
      );

      if (error) {
        console.error(error);
        toast.error(error.message || "Could not process request.");
        return;
      }

      toast.success(
        decision === "approved"
          ? "Student approved and added to the team!"
          : "Join request rejected."
      );

      await loadTeams();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setProcessingId("");
    }
  }

  // Search teams
  const filteredTeams = useMemo(() => {
    const value = search.toLowerCase();

    return teams.filter((team) => {
      return (
        team.name.toLowerCase().includes(value) ||
        team.description.toLowerCase().includes(value) ||
        team.event_name.toLowerCase().includes(value) ||
        (team.required_skills || []).some((skill) =>
          skill.toLowerCase().includes(value)
        )
      );
    });
  }, [teams, search]);

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Find Your Team
        </h1>

        <p className="text-muted-foreground">
          Connect with students, build teams and work on exciting projects.
        </p>
      </div>

      {/* Search and Create Team */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search teams, events or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateTeam}>
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>

                <DialogDescription>
                  Enter your team details and find students
                  who want to collaborate.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-5">

                <div className="space-y-2">
                  <Label>Team Name *</Label>

                  <Input
                    placeholder="Example: AI Innovators"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>

                  <Textarea
                    placeholder="Tell students about your team..."
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    maxLength={1000}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Event or Project Name *</Label>

                  <Input
                    placeholder="Example: Smart India Hackathon"
                    value={eventName}
                    onChange={(e) =>
                      setEventName(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Required Skills</Label>

                  <Input
                    placeholder="React, Python, UI/UX"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />

                  <p className="text-xs text-muted-foreground">
                    Separate skills with commas.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Team Members</Label>

                  <select
                    className="w-full rounded-md border bg-background p-2 text-sm"
                    value={maxMembers}
                    onChange={(e) =>
                      setMaxMembers(e.target.value)
                    }
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                      (number) => (
                        <option key={number} value={number}>
                          {number} Members
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>

              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams */}
      {loading ? (
        <p className="py-10 text-center text-muted-foreground">
          Loading teams...
        </p>
      ) : filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

            <h3 className="font-semibold">
              No teams found
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Create a new team or try another search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">

          {filteredTeams.map((team) => {
            const isCreator = team.created_by === currentUserId;

            const progress =
              (team.member_count / team.max_members) * 100;

            const myRequest = requests.find(
              (request) =>
                request.team_id === team.id &&
                request.user_id === currentUserId
            );

            const pendingRequests = requests.filter(
              (request) =>
                request.team_id === team.id &&
                request.status === "pending"
            );

            return (
              <Card key={team.id} className="h-full">
                <CardContent className="space-y-4 p-5">

                  {/* Team details */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {team.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {team.event_name}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      {team.member_count >= team.max_members
                        ? "Full"
                        : "Open"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {team.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {(team.required_skills || []).map(
                      (skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>

                  {/* Member count */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Team Members</span>

                      <span>
                        {team.member_count}/{team.max_members}
                      </span>
                    </div>

                    <Progress value={progress} />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Created {new Date(team.created_at).toLocaleDateString()}
                  </div>

                  {/* Creator section */}
                  {isCreator ? (
                    <div className="space-y-3 border-t pt-4">

                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          Join Requests
                        </h4>

                        <Badge variant="secondary">
                          {pendingRequests.length} Pending
                        </Badge>
                      </div>

                      {pendingRequests.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No pending join requests yet.
                        </p>
                      ) : (
                        pendingRequests.map((request) => (
                          <div
                            key={request.id}
                            className="space-y-3 rounded-lg border p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                Student requesting to join
                              </p>

                              <p className="break-all text-xs text-muted-foreground">
                                Student ID: {request.user_id}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  request.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={processingId === request.id}
                                onClick={() =>
                                  handleRequestDecision(
                                    request.id,
                                    "approved"
                                  )
                                }
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingId === request.id}
                                onClick={() =>
                                  handleRequestDecision(
                                    request.id,
                                    "rejected"
                                  )
                                }
                              >
                                <X className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    /* Other students section */
                    <div className="border-t pt-4">
                      {!currentUserId ? (
                        <Button
                          className="w-full"
                          disabled
                        >
                          Log in to Request to Join
                        </Button>
                      ) : myRequest ? (
                        <div className="flex items-center justify-center">
                          <Badge
                            variant={
                              myRequest.status === "approved"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {myRequest.status === "approved"
                              ? "Joined"
                              : myRequest.status === "pending"
                                ? "Request Pending"
                                : "Request Rejected"}
                          </Badge>
                        </div>
                      ) : team.member_count >= team.max_members ? (
                        <Button className="w-full" disabled>
                          Team Full
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() =>
                            handleJoinRequest(team.id)
                          }
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Request to Join
                        </Button>
                      )}
                    </div>
                  )}

                </CardContent>
              </Card>
            );
          })}

        </div>
      )}
    </div>
  );
}