package com.aadhiraksha.insurance.repository;

import com.aadhiraksha.insurance.model.NetworkHospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NetworkHospitalRepository extends JpaRepository<NetworkHospital, Long> {
    
    List<NetworkHospital> findByCityIgnoreCase(String city);

    @Query("SELECT DISTINCT h.city FROM NetworkHospital h ORDER BY h.city ASC")
    List<String> findDistinctCities();

    @Query("SELECT h FROM NetworkHospital h WHERE " +
           "(:city IS NULL OR CAST(:city AS text) = '' OR LOWER(h.city) = LOWER(CAST(:city AS text))) AND " +
           "(:query IS NULL OR CAST(:query AS text) = '' OR LOWER(h.hospitalName) LIKE LOWER(CONCAT('%', CAST(:query AS text), '%')) OR " +
           " LOWER(h.specialties) LIKE LOWER(CONCAT('%', CAST(:query AS text), '%')))")
    List<NetworkHospital> searchHospitals(@Param("city") String city, @Param("query") String query);
}
