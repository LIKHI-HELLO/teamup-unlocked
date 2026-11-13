import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  UserPlus,
  Users,
  Check,
  X,
  Trash2,
  UserMinus,
  RefreshCw,
  CheckCircle2,
  Clock,
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

// ==========================================
// TYPES
// ==========================================

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
  status: "active" | "completed";
};

type JoinRequest = {
  id: string;
  team_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: "creator" | "member";
  joined_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  college: string | null;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

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

  // ==========================================
  // LOAD ALL DATA
  // ==========================================

  async function loadTeams() {
    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const userId = authData.user?.id || "";
      setCurrentUserId(userId);

      // Load teams
      const { data: teamData, error: teamError } =
        await (supabase as any)
          .from("teams")
          .select("*")
          .order("created_at", { ascending: false });

      if (teamError) throw teamError;

      const loadedTeams = (teamData || []) as Team[];
      setTeams(loadedTeams);

      if (!userId || loadedTeams.length === 0) {
        setRequests([]);
        setMembers([]);
        setProfiles([]);
        return;
      }

      // Load join requests
      const { data: requestData, error: requestError } =
        await (supabase as any)
          .from("team_join_requests")
          .select("*")
          .order("created_at", { ascending: false });

      if (requestError) throw requestError;

      const loadedRequests = (requestData || []) as JoinRequest[];
      setRequests(loadedRequests);

      // Load memberships visible to this user under RLS
      const { data: memberData, error: memberError } =
        await (supabase as any)
          .from("team_members")
          .select("id, team_id, user_id, role, joined_at");

      if (memberError) throw memberError;

      const loadedMembers = (memberData || []) as TeamMember[];
      setMembers(loadedMembers);

      // Load profile details for members and requesters
      const userIds = Array.from(
        new Set([
          ...loadedMembers.map((member) => member.user_id),
          ...loadedRequests.map((request) => request.user_id),
        ])
      );

      if (userIds.length > 0) {
        const { data: profileData, error: profileError } =
          await (supabase as any)
            .from("profiles")
            .select("id, full_name, username, college")
            .in("id", userIds);

        if (profileError) {
          console.warn("Could not load profile names:", profileError);
          setProfiles([]);
        } else {
          setProfiles((profileData || []) as Profile[]);
        }
      } else {
        setProfiles([]);
      }
    } catch (error: any) {
      console.error("Load teams error:", error);
      toast.error(error.message || "Unable to load teams.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  // ==========================================
  // PROFILE NAME HELPER
  // ==========================================

  function getStudentName(userId: string) {
    const profile = profiles.find(
      (item) => item.id === userId
    );

    return (
      profile?.full_name ||
      profile?.username ||
      "Student"
    );
  }

  // ==========================================
  // CREATE TEAM
  // ==========================================

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
          status: "active",
        });

      if (error) throw error;

      toast.success("Team created successfully!");

      setName("");
      setDescription("");
      setEventName("");
      setSkills("");
      setMaxMembers("4");
      setOpen(false);

      await loadTeams();
    } catch (error: any) {
      console.error("Create team error:", error);
      toast.error(error.message || "Could not create team.");
    } finally {
      setCreating(false);
    }
  }

  // ==========================================
  // REQUEST TO JOIN
  // ==========================================

  async function handleJoinRequest(teamId: string) {
    if (!currentUserId) {
      toast.error("Please log in to request membership.");
      return;
    }

    const team = teams.find(
      (item) => item.id === teamId
    );

    if (!team) return;

    if (team.status !== "active") {
      toast.error("This team is completed.");
      return;
    }

    if (team.created_by === currentUserId) {
      toast.error("You are already the creator.");
      return;
    }

    if (team.member_count >= team.max_members) {
      toast.error("This team is already full.");
      return;
    }

    const alreadyMember = members.some(
      (member) =>
        member.team_id === teamId &&
        member.user_id === currentUserId
    );

    if (alreadyMember) {
      toast.error("You are already a member of this team.");
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

    try {
      const { error } = await (supabase as any)
        .from("team_join_requests")
        .insert({
          team_id: teamId,
          user_id: currentUserId,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Join request sent successfully!");

      await loadTeams();
    } catch (error: any) {
      console.error("Join request error:", error);

      toast.error(
        error.code === "23505"
          ? "You have already requested to join."
          : error.message || "Request could not be sent."
      );
    }
  }

  // ==========================================
  // APPROVE OR REJECT REQUEST
  // ==========================================

  async function handleRequestDecision(
    requestId: string,
    decision: "approved" | "rejected"
  ) {
    setProcessingId(requestId);

    try {
      const { error } = await (supabase as any).rpc(
        "respond_to_team_request",
        {
          p_request_id: requestId,
          p_decision: decision,
        }
      );

      if (error) throw error;

      toast.success(
        decision === "approved"
          ? "Student approved and added to the team!"
          : "Join request rejected."
      );

      await loadTeams();
    } catch (error: any) {
      console.error("Request decision error:", error);
      toast.error(error.message || "Could not process request.");
    } finally {
      setProcessingId("");
    }
  }

  // ==========================================
  // REMOVE MEMBER
  // ==========================================

  async function handleRemoveMember(
    teamId: string,
    userId: string
  ) {
    const studentName = getStudentName(userId);

    const confirmed = window.confirm(
      `Are you sure you want to remove ${studentName} from this team?`
    );

    if (!confirmed) return;

    const actionId = `remove-${teamId}-${userId}`;
    setProcessingId(actionId);

    try {
      const { error } = await (supabase as any).rpc(
        "remove_team_member",
        {
          p_team_id: teamId,
          p_user_id: userId,
        }
      );

      if (error) throw error;

      toast.success(`${studentName} removed from the team.`);

      await loadTeams();
    } catch (error: any) {
      console.error("Remove member error:", error);
      toast.error(error.message || "Could not remove member.");
    } finally {
      setProcessingId("");
    }
  }

  // ==========================================
  // COMPLETE OR REOPEN TEAM
  // ==========================================

  async function handleTeamStatus(
    teamId: string,
    status: "active" | "completed"
  ) {
    const action =
      status === "completed" ? "complete" : "reopen";

    const confirmed = window.confirm(
      status === "completed"
        ? "Are you sure you want to mark this team as completed? Pending join requests will be rejected."
        : "Are you sure you want to reopen this team?"
    );

    if (!confirmed) return;

    setProcessingId(`status-${teamId}`);

    try {
      const { error } = await (supabase as any).rpc(
        "set_team_status",
        {
          p_team_id: teamId,
          p_status: status,
        }
      );

      if (error) throw error;

      toast.success(
        status === "completed"
          ? "Team marked as completed."
          : "Team reopened successfully."
      );

      await loadTeams();
    } catch (error: any) {
      console.error(`${action} team error:`, error);
      toast.error(error.message || "Could not update team status.");
    } finally {
      setProcessingId("");
    }
  }

  // ==========================================
  // DELETE TEAM
  // ==========================================

  async function handleDeleteTeam(teamId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this team? All its membership records and join requests will also be deleted. This cannot be undone."
    );

    if (!confirmed) return;

    setProcessingId(`delete-${teamId}`);

    try {
      const { error } = await (supabase as any)
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;

      toast.success("Team deleted successfully!");

      await loadTeams();
    } catch (error: any) {
      console.error("Delete team error:", error);
      toast.error(error.message || "Could not delete team.");
    } finally {
      setProcessingId("");
    }
  }

  // ==========================================
  // SEARCH
  // ==========================================

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

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* PAGE HEADING */}

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Find Your Team
        </h1>

        <p className="text-muted-foreground">
          Connect with students, build teams and work on exciting projects.
        </p>
      </div>

      {/* SEARCH AND CREATE TEAM */}

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

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadTeams}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

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
      </div>

      {/* TEAM LIST */}

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
            const isCreator =
              team.created_by === currentUserId;

            const teamMembers = members.filter(
              (member) => member.team_id === team.id
            );

            const isMember = teamMembers.some(
              (member) => member.user_id === currentUserId
            );

            const progress = Math.min(
              100,
              (team.member_count / team.max_members) * 100
            );

            const isFull =
              team.member_count >= team.max_members;

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

            const isCompleted = team.status === "completed";

            return (
              <Card key={team.id} className="h-full">
                <CardContent className="space-y-4 p-5">

                  {/* TEAM TITLE AND STATUS */}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {team.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {team.event_name}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      {isCompleted ? (
                        <Badge variant="secondary">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      ) : isFull ? (
                        <Badge variant="secondary">
                          Full
                        </Badge>
                      ) : (
                        <Badge>
                          Open
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <p className="text-sm text-muted-foreground">
                    {team.description}
                  </p>

                  {/* REQUIRED SKILLS */}

                  <div className="flex flex-wrap gap-2">
                    {(team.required_skills || []).map(
                      (skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>

                  {/* MEMBER COUNT */}

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
                    Created{" "}
                    {new Date(team.created_at).toLocaleDateString()}
                  </div>

                  {/* TEAM MEMBERS */}

                  {(isCreator || isMember) && (
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          <Users className="mr-2 inline h-4 w-4" />
                          Team Members
                        </h4>

                        <Badge variant="secondary">
                          {teamMembers.length} Members
                        </Badge>
                      </div>

                      {teamMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No member details available.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {teamMembers.map((member) => {
                            const isTeamCreator =
                              member.role === "creator";

                            const removeId =
                              `remove-${team.id}-${member.user_id}`;

                            return (
                              <div
                                key={member.id}
                                className="flex items-center justify-between gap-2 rounded-lg border p-3"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {getStudentName(member.user_id)}
                                    {member.user_id === currentUserId
                                      ? " (You)"
                                      : ""}
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    {isTeamCreator
                                      ? "Team Creator"
                                      : "Team Member"}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isTeamCreator ? (
                                    <Badge variant="secondary">
                                      Creator
                                    </Badge>
                                  ) : isCreator ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={
                                        processingId === removeId
                                      }
                                      onClick={() =>
                                        handleRemoveMember(
                                          team.id,
                                          member.user_id
                                        )
                                      }
                                    >
                                      <UserMinus className="mr-1 h-4 w-4" />
                                      Remove
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CREATOR MANAGEMENT */}

                  {isCreator ? (
                    <div className="space-y-4 border-t pt-4">

                      {/* JOIN REQUESTS */}

                      <div className="space-y-3">
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
                            No pending join requests.
                          </p>
                        ) : (
                          pendingRequests.map((request) => (
                            <div
                              key={request.id}
                              className="space-y-3 rounded-lg border p-3"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {getStudentName(request.user_id)}
                                </p>

                                <p className="break-all text-xs text-muted-foreground">
                                  Student ID: {request.user_id}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  Requested on{" "}
                                  {new Date(
                                    request.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  disabled={
                                    processingId === request.id ||
                                    isCompleted
                                  }
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
                                  disabled={
                                    processingId === request.id
                                  }
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

                      {/* TEAM STATUS ACTIONS */}

                      <div className="space-y-2 border-t pt-4">
                        <h4 className="font-semibold">
                          Manage Team
                        </h4>

                        {isCompleted ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={
                              processingId === `status-${team.id}`
                            }
                            onClick={() =>
                              handleTeamStatus(team.id, "active")
                            }
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reopen Team
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={
                              processingId === `status-${team.id}`
                            }
                            onClick={() =>
                              handleTeamStatus(
                                team.id,
                                "completed"
                              )
                            }
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </Button>
                        )}

                        <Button
                          variant="destructive"
                          className="w-full"
                          disabled={
                            processingId === `delete-${team.id}`
                          }
                          onClick={() =>
                            handleDeleteTeam(team.id)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Team
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* OTHER STUDENTS */

                    <div className="border-t pt-4">
                      {!currentUserId ? (
                        <Button
                          className="w-full"
                          disabled
                        >
                          Log in to Request to Join
                        </Button>
                      ) : isCompleted ? (
                        <Button className="w-full" disabled>
                          Team Completed
                        </Button>
                      ) : isMember ? (
                        <div className="flex justify-center">
                          <Badge>
                            <Check className="mr-1 h-3 w-3" />
                            Joined
                          </Badge>
                        </div>
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
                              ? "Previously Approved"
                              : myRequest.status === "pending"
                                ? "Request Pending"
                                : "Request Rejected"}
                          </Badge>
                        </div>
                      ) : isFull ? (
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