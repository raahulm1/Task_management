package com.example.taskmanagement.controller;

import com.example.taskmanagement.model.Section;
import com.example.taskmanagement.service.SectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/sections")
public class SectionController {
    @Autowired
    private SectionService sectionService;

    @GetMapping
    public List<Section> getAllSections() {
        return sectionService.getAllSections();
    }

    @GetMapping("/{id}")
    public Section getSectionById(@PathVariable String id) {
        return sectionService.getSectionById(id);
    }

    @GetMapping("/project/{projectId}")
    public List<Section> getSectionsByProjectId(@PathVariable String projectId) {
        return sectionService.getSectionsByProjectId(projectId);
    }

    @PostMapping
    public Section createSection(@RequestBody Section section) {
        return sectionService.createSection(section);
    }

    @PutMapping("/{id}")
    public Section updateSection(@PathVariable String id, @RequestBody Section section) {
        return sectionService.updateSection(id, section);
    }

    @DeleteMapping("/{id}")
    public void deleteSection(@PathVariable String id) {
        sectionService.deleteSection(id);
    }
} 