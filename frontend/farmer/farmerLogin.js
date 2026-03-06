document.getElementById("farmerLoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:5000/api/farmer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("farmerId", data.farmerId);
        localStorage.setItem("farmerName", data.name);
        localStorage.setItem("farmerEmail", data.email);
        localStorage.setItem("farmerPhone", data.phone);
        alert("Login Successful");
        window.location.href = "farmer-dashboard.html";
    } else {
        alert(data.message);
    }
});
