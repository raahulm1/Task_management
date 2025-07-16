package com.example.taskmanagement.service;

import com.example.taskmanagement.model.Section;
import com.example.taskmanagement.repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SectionService {
    @Autowired
    private SectionRepository sectionRepository;

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    public Section getSectionById(String id) {
        return sectionRepository.findById(id).orElse(null);
    }

    public List<Section> getSectionsByProjectId(String projectId) {
        return sectionRepository.findByProjectId(projectId);
    }

    public Section createSection(Section section) {
        return sectionRepository.save(section);
    }

    public Section updateSection(String id, Section section) {
        section.setId(id);
        return sectionRepository.save(section);
    }

    public void deleteSection(String id) {
        sectionRepository.deleteById(id);
    }
} 