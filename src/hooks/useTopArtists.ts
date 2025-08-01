import { useState } from "react";
import fetch from "node-fetch";
import useSWR from "swr";

// Functions
import getErrorMessage from "../functions/getErrorMessage";

// Types
import { ArtistResponse, Artist } from "@/types/ArtistResponse";

interface Props {
  username: string;
  apikey: string;
  period: string;
  limit: string;
}

const useTopArtists = (props: Props) => {
  try {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);

    const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<ArtistResponse>);
    useSWR(
      `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${props.username}&api_key=${
        props.apikey
      }&format=json&period=${props.period}&limit=${props.limit || 24}`,
      fetcher,
      {
        onSuccess: (data) => {
          if (data.error) {
            const message = getErrorMessage(data.error);

            setError(new Error(message));
            setLoading(false);
          } else {
            setArtists(data.topartists.artist);
            setLoading(false);
          }
        },
        onError: (err: unknown) => {
          const error = err instanceof Error ? err : new Error("An unknown error occurred");
          setError(error);
          setLoading(false);
        },
      },
    );

    return {
      loading,
      error: error?.message || null,
      artists,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return {
      loading: false,
      error: errorMessage,
      artists: [],
    };
  }
};

export default useTopArtists;
