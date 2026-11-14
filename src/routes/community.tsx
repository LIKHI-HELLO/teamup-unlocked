import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowBigUp,
  CheckCircle2,
  MessageSquare,
  Search,
  Trophy,
  Send,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community & I'm Stuck — Student Q&A | UNSTUCK" },
      {
        name: "description",
        content:
          "Ask questions, help other students and find solutions in the UNSTUCK community.",
      },
    ],
  }),
  component: CommunityPage,
});

type Question = {
  id: string;
  title: string;
  body: string;
  author_id: string | null;
  created_at: string | null;
  tags: string[] | null;
};

type Answer = {
  id: string;
  question_id: string;
  author_id: string | null;
  body: string;
  created_at: string | null;
  is_accepted: boolean;
};

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  college: string | null;
};

type QuestionVote = {
  id: string;
  question_id: string;
  user_id: string;
};

type AnswerVote = {
  id: string;
  answer_id: string;
  user_id: string;
};

type LeaderboardUser = {
  id: string;
  name: string;
  college: string;
  points: number;
};

function CommunityPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [questionVotes, setQuestionVotes] = useState<QuestionVote[]>([]);
  const [answerVotes, setAnswerVotes] = useState<AnswerVote[]>([]);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recent");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [answering, setAnswering] = useState<string | null>(null);
  const [voting, setVoting] = useState<string | null>(null);

  const [askOpen, setAskOpen] = useState(false);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [questionTags, setQuestionTags] = useState("");

  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>(
    {},
  );

  // Get the logged-in user and listen for authentication changes.
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error) {
        console.error("Authentication error:", error.message);
        return;
      }

      setUserId(data.user?.id ?? null);
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load all community data from Supabase.
  const loadCommunity = async () => {
    setLoading(true);

    try {
      const [
        questionResult,
        answerResult,
        questionVoteResult,
        answerVoteResult,
        profileResult,
      ] = await Promise.all([
        supabase.from("questions").select("*").order("created_at", {
          ascending: false,
        }),
        supabase.from("answers").select("*").order("created_at", {
          ascending: true,
        }),
        supabase.from("question_votes").select("*"),
        supabase.from("answer_votes").select("*"),
        supabase
          .from("profiles")
          .select("id, full_name, username, college"),
      ]);

      if (questionResult.error) throw questionResult.error;
      if (answerResult.error) throw answerResult.error;
      if (questionVoteResult.error) throw questionVoteResult.error;
      if (answerVoteResult.error) throw answerVoteResult.error;
      if (profileResult.error) throw profileResult.error;

      setQuestions((questionResult.data ?? []) as Question[]);
      setAnswers((answerResult.data ?? []) as Answer[]);
      setQuestionVotes((questionVoteResult.data ?? []) as QuestionVote[]);
      setAnswerVotes((answerVoteResult.data ?? []) as AnswerVote[]);
      setProfiles((profileResult.data ?? []) as Profile[]);
    } catch (error) {
      console.error("Community loading error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load community data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCommunity();
  }, []);

  const getProfile = (id: string | null) => {
    if (!id) return null;
    return profiles.find((profile) => profile.id === id) ?? null;
  };

  const getAuthorName = (id: string | null) => {
    const profile = getProfile(id);

    return (
      profile?.full_name ||
      profile?.username ||
      "Student"
    );
  };

  const getQuestionAnswers = (questionId: string) =>
    answers.filter((answer) => answer.question_id === questionId);

  const getQuestionVotes = (questionId: string) =>
    questionVotes.filter((vote) => vote.question_id === questionId);

  const getAnswerVotes = (answerId: string) =>
    answerVotes.filter((vote) => vote.answer_id === answerId);

  // Search questions by title, description or tags.
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return questions;

    return questions.filter((question) => {
      const titleMatch = question.title.toLowerCase().includes(search);
      const bodyMatch = question.body.toLowerCase().includes(search);
      const tagMatch = (question.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(search),
      );

      return titleMatch || bodyMatch || tagMatch;
    });
  }, [questions, query]);

  const displayedQuestions = useMemo(() => {
    if (activeTab === "trending") {
      return [...filtered].sort(
        (a, b) =>
          getQuestionVotes(b.id).length -
          getQuestionVotes(a.id).length,
      );
    }

    if (activeTab === "unsolved") {
      return filtered.filter(
        (question) =>
          !getQuestionAnswers(question.id).some(
            (answer) => answer.is_accepted,
          ),
      );
    }

    return filtered;
  }, [filtered, activeTab, questionVotes, answers]);

  // Calculate leaderboard points from real contributions.
  const leaderboard = useMemo(() => {
    const users: LeaderboardUser[] = profiles.map((profile) => {
      const questionCount = questions.filter(
        (question) => question.author_id === profile.id,
      ).length;

      const answerCount = answers.filter(
        (answer) => answer.author_id === profile.id,
      ).length;

      const acceptedCount = answers.filter(
        (answer) =>
          answer.author_id === profile.id && answer.is_accepted,
      ).length;

      const receivedQuestionVotes = questionVotes.filter((vote) => {
        const question = questions.find(
          (item) => item.id === vote.question_id,
        );
        return question?.author_id === profile.id;
      }).length;

      const receivedAnswerVotes = answerVotes.filter((vote) => {
        const answer = answers.find(
          (item) => item.id === vote.answer_id,
        );
        return answer?.author_id === profile.id;
      }).length;

      return {
        id: profile.id,
        name: profile.full_name || profile.username || "Student",
        college: profile.college || "Student",
        points:
          questionCount * 5 +
          answerCount * 10 +
          acceptedCount * 15 +
          receivedQuestionVotes * 2 +
          receivedAnswerVotes * 3,
      };
    });

    return users
      .filter((user) => user.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [profiles, questions, answers, questionVotes, answerVotes]);

  // Submit a new question.
  const handlePostQuestion = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!userId) {
      toast.error("Please log in before posting a question.");
      return;
    }

    if (!questionTitle.trim() || !questionBody.trim()) {
      toast.error("Please enter a title and description.");
      return;
    }

    setPosting(true);

    try {
      const tags = questionTags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

      const { error } = await supabase.from("questions").insert({
        title: questionTitle.trim(),
        body: questionBody.trim(),
        tags,
        author_id: userId,
      });

      if (error) throw error;

      toast.success("Your question has been posted!");

      setQuestionTitle("");
      setQuestionBody("");
      setQuestionTags("");
      setAskOpen(false);

      await loadCommunity();
    } catch (error) {
      console.error("Question posting error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to post your question.",
      );
    } finally {
      setPosting(false);
    }
  };

  // Submit an answer.
  const handlePostAnswer = async (questionId: string) => {
    if (!userId) {
      toast.error("Please log in before answering.");
      return;
    }

    const body = answerInputs[questionId]?.trim();

    if (!body) {
      toast.error("Please enter your answer.");
      return;
    }

    setAnswering(questionId);

    try {
      const { error } = await supabase.from("answers").insert({
        question_id: questionId,
        author_id: userId,
        body,
      });

      if (error) throw error;

      toast.success("Your answer has been posted!");

      setAnswerInputs((previous) => ({
        ...previous,
        [questionId]: "",
      }));

      await loadCommunity();
    } catch (error) {
      console.error("Answer posting error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to post your answer.",
      );
    } finally {
      setAnswering(null);
    }
  };

  // Toggle a question vote.
  const handleQuestionVote = async (questionId: string) => {
    if (!userId) {
      toast.error("Please log in to vote.");
      return;
    }

    const actionId = `question-${questionId}`;
    setVoting(actionId);

    try {
      const existingVote = questionVotes.find(
        (vote) =>
          vote.question_id === questionId &&
          vote.user_id === userId,
      );

      if (existingVote) {
        const { error } = await supabase
          .from("question_votes")
          .delete()
          .eq("id", existingVote.id);

        if (error) throw error;

        toast.success("Vote removed.");
      } else {
        const { error } = await supabase
          .from("question_votes")
          .insert({
            question_id: questionId,
            user_id: userId,
          });

        if (error) throw error;

        toast.success("Vote added!");
      }

      await loadCommunity();
    } catch (error) {
      console.error("Question voting error:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to vote.",
      );
    } finally {
      setVoting(null);
    }
  };

  // Toggle an answer vote.
  const handleAnswerVote = async (answerId: string) => {
    if (!userId) {
      toast.error("Please log in to vote.");
      return;
    }

    const actionId = `answer-${answerId}`;
    setVoting(actionId);

    try {
      const existingVote = answerVotes.find(
        (vote) =>
          vote.answer_id === answerId &&
          vote.user_id === userId,
      );

      if (existingVote) {
        const { error } = await supabase
          .from("answer_votes")
          .delete()
          .eq("id", existingVote.id);

        if (error) throw error;

        toast.success("Vote removed.");
      } else {
        const { error } = await supabase
          .from("answer_votes")
          .insert({
            answer_id: answerId,
            user_id: userId,
          });

        if (error) throw error;

        toast.success("Vote added!");
      }

      await loadCommunity();
    } catch (error) {
      console.error("Answer voting error:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to vote.",
      );
    } finally {
      setVoting(null);
    }
  };

  // Accept an answer using the secure database function.
  const handleAcceptAnswer = async (answerId: string) => {
    if (!userId) {
      toast.error("Please log in first.");
      return;
    }

    try {
      const { error } = await supabase.rpc(
        "accept_community_answer",
        {
          p_answer_id: answerId,
        },
      );

      if (error) throw error;

      toast.success("Answer accepted successfully!");
      await loadCommunity();
    } catch (error) {
      console.error("Accept answer error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to accept this answer.",
      );
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Stuck at 2 AM? Someone here has solved it."
        subtitle="Ask questions, answer others, mark accepted solutions and earn reputation points."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search problems and tags"
              className="h-11 rounded-full pl-9"
              aria-label="Search problems"
            />
          </div>

          <Dialog open={askOpen} onOpenChange={setAskOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-glow">
                I'm Stuck — Post a problem
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Post your problem</DialogTitle>
                <DialogDescription>
                  Be specific — what you tried, what broke, and what you expected.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handlePostQuestion}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="q-title">Title</Label>
                  <Input
                    id="q-title"
                    required
                    maxLength={200}
                    value={questionTitle}
                    onChange={(event) =>
                      setQuestionTitle(event.target.value)
                    }
                    placeholder="Why does my build fail on deploy?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="q-body">Description</Label>
                  <Textarea
                    id="q-body"
                    required
                    rows={5}
                    value={questionBody}
                    onChange={(event) =>
                      setQuestionBody(event.target.value)
                    }
                    placeholder="Describe the problem in detail"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="q-tags">Tags</Label>
                  <Input
                    id="q-tags"
                    value={questionTags}
                    onChange={(event) =>
                      setQuestionTags(event.target.value)
                    }
                    placeholder="react, deployment"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas.
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={posting}
                    className="rounded-full"
                  >
                    {posting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post question"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.7fr_1fr]">
        <div className="min-w-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="rounded-full">
              <TabsTrigger value="recent" className="rounded-full">
                Recent
              </TabsTrigger>
              <TabsTrigger value="trending" className="rounded-full">
                Trending
              </TabsTrigger>
              <TabsTrigger value="unsolved" className="rounded-full">
                Unsolved
              </TabsTrigger>
            </TabsList>

            {(["recent", "trending", "unsolved"] as const).map((tab) => (
              <TabsContent
                key={tab}
                value={tab}
                className="mt-5 space-y-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2 rounded-3xl border p-12 text-sm text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    Loading community questions...
                  </div>
                ) : displayedQuestions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                    No questions found. Be the first to post!
                  </div>
                ) : (
                  displayedQuestions.map((question) => {
                    const questionAnswers = getQuestionAnswers(question.id);
                    const votes = getQuestionVotes(question.id);
                    const hasVoted = votes.some(
                      (vote) => vote.user_id === userId,
                    );
                    const solved = questionAnswers.some(
                      (answer) => answer.is_accepted,
                    );

                    return (
                      <Card
                        key={question.id}
                        className="card-hover rounded-2xl"
                      >
                        <CardContent className="flex gap-4 p-5">
                          <div className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-xl bg-secondary py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              disabled={voting === `question-${question.id}`}
                              onClick={() =>
                                void handleQuestionVote(question.id)
                              }
                              aria-label="Upvote question"
                            >
                              <ArrowBigUp
                                className={`size-5 ${
                                  hasVoted ? "text-primary fill-primary" : ""
                                }`}
                              />
                            </Button>

                            <span className="text-sm font-semibold">
                              {votes.length}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-semibold">
                                {question.title}
                              </h2>

                              {solved && (
                                <Badge className="rounded-full bg-success text-primary-foreground">
                                  <CheckCircle2 className="mr-1 size-3.5" />
                                  Solved
                                </Badge>
                              )}
                            </div>

                            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                              {question.body}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {(question.tags ?? []).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                By {getAuthorName(question.author_id)}
                              </span>
                              <span>·</span>
                              <span>{formatDate(question.created_at)}</span>
                              <span className="ml-auto flex items-center gap-1">
                                <MessageSquare className="size-3.5" />
                                {questionAnswers.length} answers
                              </span>
                            </div>

                            {/* Answers */}
                            <div className="mt-5 space-y-3">
                              {questionAnswers.map((answer) => {
                                const answerVoteList = getAnswerVotes(
                                  answer.id,
                                );

                                const answerHasVoted =
                                  answerVoteList.some(
                                    (vote) => vote.user_id === userId,
                                  );

                                return (
                                  <div
                                    key={answer.id}
                                    className="rounded-xl border bg-secondary/30 p-4"
                                  >
                                    <div className="flex items-start gap-3">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0"
                                        disabled={
                                          voting === `answer-${answer.id}`
                                        }
                                        onClick={() =>
                                          void handleAnswerVote(answer.id)
                                        }
                                        aria-label="Upvote answer"
                                      >
                                        <ArrowBigUp
                                          className={`size-5 ${
                                            answerHasVoted
                                              ? "fill-primary text-primary"
                                              : ""
                                          }`}
                                        />
                                      </Button>

                                      <div className="min-w-0 flex-1">
                                        <p className="whitespace-pre-wrap text-sm">
                                          {answer.body}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                          <span>
                                            {getAuthorName(answer.author_id)}
                                          </span>
                                          <span>·</span>
                                          <span>
                                            {formatDate(answer.created_at)}
                                          </span>
                                          <span>
                                            · {answerVoteList.length} votes
                                          </span>
                                        </div>

                                        {answer.is_accepted && (
                                          <Badge className="mt-2 rounded-full bg-success text-primary-foreground">
                                            <CheckCircle2 className="mr-1 size-3.5" />
                                            Accepted answer
                                          </Badge>
                                        )}

                                        {userId === question.author_id &&
                                          !answer.is_accepted && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="mt-3 rounded-full"
                                              onClick={() =>
                                                void handleAcceptAnswer(
                                                  answer.id,
                                                )
                                              }
                                            >
                                              <CheckCircle2 className="mr-1 size-4" />
                                              Accept answer
                                            </Button>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Answer form */}
                            <div className="mt-4 space-y-2">
                              <Textarea
                                rows={2}
                                value={answerInputs[question.id] ?? ""}
                                onChange={(event) =>
                                  setAnswerInputs((previous) => ({
                                    ...previous,
                                    [question.id]: event.target.value,
                                  }))
                                }
                                placeholder={
                                  userId
                                    ? "Write a helpful answer..."
                                    : "Log in to write an answer..."
                                }
                                disabled={!userId}
                              />

                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  className="rounded-full"
                                  disabled={
                                    !userId ||
                                    !answerInputs[question.id]?.trim() ||
                                    answering === question.id
                                  }
                                  onClick={() =>
                                    void handlePostAnswer(question.id)
                                  }
                                >
                                  {answering === question.id ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                  ) : (
                                    <Send className="mr-2 size-4" />
                                  )}
                                  Post answer
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <aside className="space-y-6">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Trophy className="size-4 text-warning" />
                Community leaderboard
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Points are calculated from questions, answers and votes.
              </p>

              {leaderboard.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No contributions yet. Start helping other students!
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {leaderboard.map((user, index) => (
                    <li
                      key={user.id}
                      className="flex items-center gap-3"
                    >
                      <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {user.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {user.college}
                        </div>
                      </div>

                      <span className="text-sm font-semibold text-primary">
                        {user.points} pts
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold">
                Badges you can earn
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Problem Solver",
                  "Team Builder",
                  "Hackathon Champion",
                  "Mentor",
                  "Top Contributor",
                ].map((badge) => (
                  <Badge
                    key={badge}
                    variant="secondary"
                    className="rounded-full"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </>
  );
}