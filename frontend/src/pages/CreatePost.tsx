import postService from "../services/posts";
import { type Post } from "../types/Post";
import { setSuccessMessage, addPost, modifyPost } from "../store";
import { useAppSelector, useAppDispatch, useWindowDimensions } from "../hooks";
import { Box, FormControl, TextField, Button, Autocomplete } from "@mui/material";

import React from "react";

type Props = {
    handleClose: () => void;
    post: Post;
};

const CreatePost: React.FC<Props> = ({ handleClose, post }: Props) => {
    const [tag, setTag] = React.useState(post.Tag || "");
    const [tagValid, setTagValid] = React.useState("");
    const [content, setContent] = React.useState(post.Content || "");
    const [contentValid, setContentValid] = React.useState("");
    const [category, setCategory] = React.useState(post.Category || "");
    const [categoryValid, setCategoryValid] = React.useState("");

    const { width } = useWindowDimensions();

    const token = useAppSelector((state) => state.token);
    const posts = useAppSelector((state) => state.posts);

    const dispatch = useAppDispatch();

    const handleTagChange = (event: React.ChangeEvent) => {
        event.preventDefault();
        setTag((event.target as HTMLInputElement).value);
        setTagValid("");
    };

    const handleContentChange = (event: React.ChangeEvent) => {
        event.preventDefault();
        setContent((event.target as HTMLInputElement).value);
        setContentValid("");
    };

    const handleCreatePost = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (post.ID) {
                const res = await postService.modifyPost(post.ID, token.Token, { tag, content, category });
                await dispatch(modifyPost(res));
                await dispatch(setSuccessMessage(`Success! You have edited your existing post with tag ${res.Tag}`));
                handleClose();
            } else {
                const res = await postService.createPost({ tag, content, category }, token.Token);
                await dispatch(setSuccessMessage(`Success! You have created a post with tag ${res.Tag}`));
                await dispatch(addPost(res));
                handleClose();
            }
        } catch (err) {
            try {
                const obj = JSON.parse((err as Error).message);
                if (obj.Tag) {
                    setTagValid(obj.Tag);
                }
                if (obj.Content) {
                    setContentValid(obj.Content);
                }
                if (obj.Category) {
                    setCategoryValid(obj.Category);
                }
                if (!(obj.Tag || obj.Content || obj.Category)) {
                    setTagValid((err as Error).message);
                }
            } catch (e) {
                setTagValid((err as Error).message);
            }
        }
    };
    const boxStyle = {
        backgroundColor: "white",
        padding: "3vw",
        textAlign: "center",
        height: "70vh",
        overflow: "scroll",
    };
    return (
        <Box sx={width < 900 ? { ...boxStyle, width: "90vw" } : { ...boxStyle, width: "40vw" }}>
            {post.ID ? <h2>Edit Post</h2> : <h2>Create Post</h2>}
            <br></br>
            <FormControl sx={{ width: 1 }}>
                <TextField
                    id="tag"
                    label="Tag"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    value={tag}
                    onChange={handleTagChange}
                    error={tagValid !== ""}
                    helperText={tagValid}
                />
                <Autocomplete
                    id="category"
                    freeSolo
                    value={category}
                    sx={{ marginBottom: 2 }}
                    onChange={(event, newValue) => {
                        setCategory(newValue || "");
                        setCategoryValid("");
                    }}
                    options={posts
                        .map((post) => post.Category)
                        .filter((value, index, array) => array.indexOf(value) === index)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Category"
                            error={categoryValid != ""}
                            helperText={categoryValid}
                            onChange={(event: React.ChangeEvent) => {
                                event.preventDefault();
                                setCategory((event.target as HTMLInputElement).value);
                                setCategoryValid("");
                            }}
                        />
                    )}
                />
                <TextField
                    id="content"
                    label="Content"
                    sx={{ marginBottom: 4, backgroundColor: "white" }}
                    value={content}
                    onChange={handleContentChange}
                    error={contentValid !== ""}
                    helperText={contentValid}
                    multiline
                    rows={15}
                />
                <Button variant="contained" onClick={handleCreatePost}>
                    {post.ID ? `Edit Post` : `Create Post`}
                </Button>
            </FormControl>
        </Box>
    );
};

export default CreatePost;
