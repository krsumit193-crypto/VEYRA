package com.veyra.veyrabackend;

public class Persona {

    private String name;
    private int age;
    private String gender;
    private String personality;
    private String backstory;
    private String speechStyle;
    private String boundaries;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPersonality() {
        return personality;
    }

    public void setPersonality(String personality) {
        this.personality = personality;
    }

    public String getBackstory() {
        return backstory;
    }

    public void setBackstory(String backstory) {
        this.backstory = backstory;
    }

    public String getSpeechStyle() {
        return speechStyle;
    }

    public void setSpeechStyle(String speechStyle) {
        this.speechStyle = speechStyle;
    }

    public String getBoundaries() {
        return boundaries;
    }

    public void setBoundaries(String boundaries) {
        this.boundaries = boundaries;
    }
}
