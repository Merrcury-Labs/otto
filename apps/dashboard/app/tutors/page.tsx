"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, UserCircle } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";

import { graphqlFetch } from "@/lib/graphql/client";
import {
  createTutorForOwnerMutation,
  tutorsQuery,
} from "@/lib/graphql/orgs";

type Tutor = {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
};

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTutors = useCallback(async () => {
    try {
      const result = await graphqlFetch<{ tutors: Tutor[] }>({
        query: tutorsQuery,
        operationName: "Tutors",
      });
      setTutors(result.tutors);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load tutors.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTutors();
  }, [loadTutors]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await graphqlFetch({
        query: createTutorForOwnerMutation,
        operationName: "CreateTutorForOwner",
        variables: {
          name: String(formData.get("name") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          bio: String(formData.get("bio") ?? "").trim() || null,
          profilePicture: "",
        },
      });
      form.reset();
      await loadTutors();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to add tutor.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-normal tracking-tight">Tutors</h1>
        <p className="text-muted-foreground">
          Add and manage the people who create courses for your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" /> Add tutor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
            <Input name="name" placeholder="Full name" required />
            <Input name="email" type="email" placeholder="Email address" required />
            <Input name="bio" placeholder="Short bio (optional)" />
            <div className="md:col-span-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add tutor"}
              </Button>
            </div>
          </form>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tutors...</p>
        ) : tutors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tutors yet.</p>
        ) : (
          tutors.map((tutor) => (
            <Card key={tutor.id}>
              <CardContent className="flex items-start gap-3 pt-6">
                <UserCircle className="h-10 w-10 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium">{tutor.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {tutor.email}
                  </p>
                  {tutor.bio ? (
                    <p className="mt-2 text-sm text-muted-foreground">{tutor.bio}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
