## Service–Repository Pattern (Node.js / TypeScript) – Interview Friendly Notes

Isko aise samjho jaise 3-layer waali architecture:

- **Controller layer (ūpar waali layer)**  
  - Ye HTTP request/response handle karti hai.  
  - Example: `userController` – `POST /api/users/register` pe data leta hai aur service ko call karta hai.  
  - Yaha pe **business logic ya database queries** nahi likhte.

- **Service layer (beech waali layer – “dimag”)**  
  - Ye **business rules** rakhti hai – “kya allowed hai, kya nahi”.  
  - Example: `UserService` – check karega ki email already exist to nahi, password validate karega, etc.  
  - Service **repository ko use karta hai**, direct database ko nahi.

- **Repository layer (neeche waali layer – “database access”)**  
  - Ye sirf **database se baat karne** ka kaam karti hai (Prisma / SQL queries).  
  - Example: `UserRepository` – `findByEmail`, `createUser`, `getUserById` jaise methods deta hai.  
  - Agar kal ko PostgreSQL se MongoDB par shift hona ho, to mostly sirf repository layer change hogi, service/controller zyada nahi.

---

### Simple Example Flow – Register User

1. **Controller** request leta hai:  
   - Route: `POST /api/users/register`  
   - Body: `{ name, email, password }`  
   - Controller validation ke baad `userService.registerUser()` call karta hai.

2. **Service** business logic lagata hai:  
   - Pehle `userRepository.findByEmail(email)` se check karta hai ki user already exist to nahi.  
   - Agar exist ho to error throw karta hai (e.g. “User already exists”).  
   - Agar nahi ho to `userRepository.create(...)` ko call karke naya user create karwata hai.  
   - Aane wale time me password hashing, email verification, audit logs, sab yahi add honge.

3. **Repository** database se baat karta hai (Prisma):  
   - `findByEmail` → `prisma.user.findUnique({ where: { email } })`  
   - `create` → `prisma.user.create({ data })`

Is tarah se:

- Controller: **request/response**  
- Service: **business logic**  
- Repository: **database access**

---

### Interview me kaise explain karein (English + Hindi)

**Short English version:**

> In my Node.js projects I use the Service–Repository pattern.  
> Controllers are very thin – they only handle HTTP requests and responses.  
> All business logic lives inside Services, and Services never talk to the database directly.  
> Instead, they call Repositories, which are responsible for all Prisma/SQL operations.  
> This makes my code easy to test, easy to change the database layer, and keeps each layer focused on a single responsibility.

**Short Hinglish version:**

> Mere backend projects mé main Service–Repository pattern use karta hoon.  
> Controllers sirf request aur response handle karte hain, heavy logic nahi rakhte.  
> Saara business logic Service layer mé hota hai, jo sirf Repository ko call karti hai.  
> Repository hi Prisma ya SQL ke through database se directly baat karti hai.  
> Isse code clean, testable aur maintain karna kaafi aasan ho jaata hai.

---

### Is pattern ke fayde (Benefits)

- **Separation of Concerns**  
  - Har layer ka kaam clear hai – controller, service, repository mix nahi hote.

- **Testability**  
  - Service ko unit test mé easily test kar sakte ho by mocking the repository.  
  - Example: aap `UserRepository` ka fake/mock version banake `UserService` ke rules test kar sakte ho.

- **Easy to change database / ORM**  
  - Agar kal Prisma se kisi aur ORM ya DB pe jana ho, mostly **repository layer** change hogi.  
  - Baaki service/controller logic same rahega.

- **Reusability**  
  - Ek hi Repository methods ko multiple services use kar sakti hain.  
  - Ek hi Service ko multiple controllers ya routes use kar sakte hain.

---

### Is project me pattern ka example

- **Controllers**  
  - File: `src/controllers/userController.ts`  
  - Kaam: HTTP request se data lena, `UserService` ko call karna, response bhejna.

- **Services**  
  - File: `src/services/userService.ts`  
  - Kaam:  
    - Check karna ki user already exist to nahi.  
    - Business rules apply karna (future me: password hashing, validation, etc.).  
    - `UserRepository` ko call karna.

- **Repositories**  
  - File: `src/repositories/userRepository.ts`  
  - Kaam: Prisma ke through `User` table ke saath kaam karna – `findByEmail`, `create`, etc.

Aur database ke liye:

- **Prisma schema**  
  - File: `prisma/schema.prisma`  
  - Tables: `User`, `Category`, `Expense` with proper foreign key relations:
    - Ek `User` ke bahut saare `Expenses` aur `Categories` hain.  
    - `Expense` `userId` aur `categoryId` se link hota hai.

Ab jab aap interview me baat karoge, aap confidently bol sakte ho ki:

- Aapne **clean architecture style** follow kiya hai.  
- Aapko **Service–Repository pattern** ka clear understanding hai.  
- Aap real world me is pattern ko **Node.js + TypeScript + Prisma + PostgreSQL** ke saath use kar chuke ho.

