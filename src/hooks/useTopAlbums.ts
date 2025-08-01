import { useState } from "react";
import fetch from "node-fetch";
import useSWR from "swr";

// Functions
import getErrorMessage from "../functions/getErrorMessage";

// Types
import { AlbumResponse, Album } from "@/types/AlbumResponse";

interface Props {
  username: string;
  apikey: string;
  period: string;
  limit: string;
}

const useTopAlbums = (props: Props) => {
  try {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);

    const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<AlbumResponse>);
    useSWR(
      `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${props.username}&api_key=${
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
            setAlbums(data.topalbums.album);
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
      albums,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return {
      loading: false,
      error: errorMessage,
      albums: [],
    };
  }
};

export default useTopAlbums;
