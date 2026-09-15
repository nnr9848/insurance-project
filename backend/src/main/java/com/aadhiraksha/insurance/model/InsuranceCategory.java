package com.aadhiraksha.insurance.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "insurance_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String slug;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_name", length = 50)
    private String iconName;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
