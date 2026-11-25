package com.veyra.veyrabackend;

import java.util.List;

public class Story {

    private String id;
    private String title;
    private String section;
    private List<String> genres;
    private Integer featuredRank;
    private String avatar;
    private String hook;
    private String openingMessage;
    private String status;
    private String backgroundClass;
    private String look;
    private String createdOn;
    private Persona character;
    private String setting;
    private String scenario;
    private String openingBeat;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    public Integer getFeaturedRank() {
        return featuredRank;
    }

    public void setFeaturedRank(Integer featuredRank) {
        this.featuredRank = featuredRank;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getHook() {
        return hook;
    }

    public void setHook(String hook) {
        this.hook = hook;
    }

    public String getOpeningMessage() {
        return openingMessage;
    }

    public void setOpeningMessage(String openingMessage) {
        this.openingMessage = openingMessage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBackgroundClass() {
        return backgroundClass;
    }

    public void setBackgroundClass(String backgroundClass) {
        this.backgroundClass = backgroundClass;
    }

    public String getLook() {
        return look;
    }

    public void setLook(String look) {
        this.look = look;
    }

    public String getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(String createdOn) {
        this.createdOn = createdOn;
    }

    public Persona getCharacter() {
        return character;
    }

    public void setCharacter(Persona character) {
        this.character = character;
    }

    public String getSetting() {
        return setting;
    }

    public void setSetting(String setting) {
        this.setting = setting;
    }

    public String getScenario() {
        return scenario;
    }

    public void setScenario(String scenario) {
        this.scenario = scenario;
    }

    public String getOpeningBeat() {
        return openingBeat;
    }

    public void setOpeningBeat(String openingBeat) {
        this.openingBeat = openingBeat;
    }
}
