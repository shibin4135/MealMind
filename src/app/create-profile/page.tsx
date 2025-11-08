"use client";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ApiResponse {
  message: string;
}

const createProfile = async () => {
  try {
    const response = await fetch("/api/create-profile", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    });
    const data = await response.json();
    return data as ApiResponse;
  } catch (error: any) {
    console.log("Something Went Wrong", error);
    throw new Error(error.message);
  }
};

const Profile = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const { mutate, isPending } = useMutation<ApiResponse, Error>({
    mutationFn: createProfile,
    onSuccess: () => {
      toast.success("Profile Created Successfully");
      toast.success("Redirecting To Subscribe.....");
      router.push("/subscribe");
    },  
    onError: (error) => {
      console.log(error);
      toast.error("Failed to create profile");
    },
  });

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPending) {
      mutate();
    }
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </div>
          <CardTitle>Creating Your Profile</CardTitle>
          <CardDescription>
            Please wait while we set up your account...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Profile;
